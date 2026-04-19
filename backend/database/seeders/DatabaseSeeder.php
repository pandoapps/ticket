<?php

namespace Database\Seeders;

use App\Enums\EventStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ProducerStatus;
use App\Enums\UserRole;
use App\Enums\VenueType;
use App\Models\Event;
use App\Models\Order;
use App\Models\PlatformSetting;
use App\Models\Producer;
use App\Models\Ticket;
use App\Models\TicketLot;
use App\Models\User;
use App\Services\PricingService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        PlatformSetting::updateOrCreate(
            ['id' => 1],
            ['commission_percent' => 10.00, 'fixed_fee_cents' => 0],
        );

        User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Admin',
                'password' => '123456',
                'role' => UserRole::Admin->value,
            ],
        );

        $producerUser = User::updateOrCreate(
            ['email' => 'produtor@produtor.com'],
            [
                'name' => 'Produtor Demo',
                'password' => '123456',
                'role' => UserRole::Producer->value,
            ],
        );

        User::updateOrCreate(
            ['email' => 'cliente@cliente.com'],
            [
                'name' => 'Cliente Demo',
                'password' => '123456',
                'role' => UserRole::Customer->value,
            ],
        );

        $producer = Producer::updateOrCreate(
            ['user_id' => $producerUser->id],
            [
                'company_name' => 'Shows Demo Produções',
                'document' => '12.345.678/0001-00',
                'phone' => '+55 11 99999-0000',
                'status' => ProducerStatus::Approved->value,
                'approved_at' => now(),
            ],
        );

        $producer->credentials()->updateOrCreate(
            [],
            [
                'secret_key' => 'abc_dev_demo_key',
                'environment' => \App\Enums\AbacateEnvironment::Sandbox->value,
                'validated_at' => now(),
            ],
        );

        foreach ($this->events() as $data) {
            $event = Event::updateOrCreate(
                ['slug' => Str::slug($data['name'])],
                [
                    'producer_id' => $producer->id,
                    'name' => $data['name'],
                    'description' => $data['description'],
                    'starts_at' => $data['starts_at'],
                    'ends_at' => $data['ends_at'] ?? null,
                    'venue_type' => $data['venue_type'],
                    'venue_name' => $data['venue_name'] ?? null,
                    'venue_address' => $data['venue_address'] ?? null,
                    'online_url' => $data['online_url'] ?? null,
                    'banner_url' => $data['banner_url'],
                    'is_featured' => $data['is_featured'] ?? false,
                    'status' => EventStatus::Published->value,
                    'published_at' => now(),
                ],
            );

            foreach ($data['lots'] as $lot) {
                TicketLot::updateOrCreate(
                    ['event_id' => $event->id, 'name' => $lot['name']],
                    [
                        'price' => $lot['price'],
                        'quantity' => $lot['quantity'],
                        'is_half_price' => $lot['is_half_price'] ?? false,
                        'sales_end_at' => $lot['sales_end_at'] ?? null,
                    ],
                );
            }
        }

        $this->seedCustomersAndOrders($producer);
    }

    private function seedCustomersAndOrders(Producer $producer): void
    {
        $customerNames = [
            'Ana Beatriz Souza', 'Bruno Carvalho', 'Camila Ferreira', 'Daniel Rocha',
            'Eduarda Martins', 'Felipe Andrade', 'Gabriela Lima', 'Henrique Silva',
            'Isabela Costa', 'João Pedro Reis', 'Karla Oliveira', 'Lucas Mendes',
            'Marina Ribeiro', 'Natália Pires', 'Otávio Cunha', 'Patrícia Azevedo',
            'Rafael Barros', 'Sofia Moreira', 'Thiago Nunes', 'Vanessa Freitas',
            'Wagner Lopes', 'Yasmin Cardoso', 'Bruno Henrique Matos', 'Larissa Dias',
            'Marcelo Teixeira',
        ];

        $customers = collect($customerNames)->map(function (string $name) {
            $slug = Str::slug($name, '.');
            return User::updateOrCreate(
                ['email' => "{$slug}@ticketeira.local"],
                [
                    'name' => $name,
                    'password' => '123456',
                    'role' => UserRole::Customer->value,
                ],
            );
        });

        $pricing = new PricingService();
        $events = Event::with('lots')->get();
        $rng = random_int(1, PHP_INT_MAX);
        mt_srand(42);

        foreach ($customers as $customer) {
            $purchases = mt_rand(1, 4);
            for ($i = 0; $i < $purchases; $i++) {
                $event = $events->random();
                $lots = $event->lots->filter(fn ($lot) => $lot->price > 0)->values();
                if ($lots->isEmpty()) continue;

                $pickedLots = $lots->random(min($lots->count(), mt_rand(1, 2)));
                $items = [];
                $subtotal = 0.0;

                foreach ($pickedLots as $lot) {
                    $qty = mt_rand(1, 3);
                    $unit = (float) $lot->price;
                    $sub = $unit * $qty;
                    $subtotal += $sub;
                    $items[] = ['lot' => $lot, 'quantity' => $qty, 'unit_price' => $unit, 'subtotal' => $sub];

                    $lot->increment('sold', $qty);
                }

                $breakdown = $pricing->breakdown($subtotal);
                $paid = mt_rand(1, 10) <= 8;
                $createdAt = now()->subDays(mt_rand(0, 28))->subHours(mt_rand(0, 23));

                $order = Order::create([
                    'customer_id' => $customer->id,
                    'producer_id' => $producer->id,
                    'event_id' => $event->id,
                    'subtotal' => $breakdown['subtotal'],
                    'platform_fee' => $breakdown['platform_fee'],
                    'total' => $breakdown['total'],
                    'status' => $paid ? OrderStatus::Paid->value : OrderStatus::Pending->value,
                    'abacate_charge_id' => 'seed_'.Str::random(16),
                    'paid_at' => $paid ? $createdAt->copy()->addMinutes(mt_rand(2, 60)) : null,
                    'expires_at' => $paid ? null : now()->addMinutes(30),
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);

                foreach ($items as $item) {
                    $order->items()->create([
                        'ticket_lot_id' => $item['lot']->id,
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'subtotal' => $item['subtotal'],
                    ]);
                }

                $order->payments()->create([
                    'gateway' => 'abacate_pay',
                    'gateway_charge_id' => $order->abacate_charge_id,
                    'status' => $paid ? PaymentStatus::Paid->value : PaymentStatus::Pending->value,
                    'amount' => $order->total,
                    'payload' => ['seeded' => true],
                ]);

                if ($paid) {
                    foreach ($items as $item) {
                        for ($n = 0; $n < $item['quantity']; $n++) {
                            $ticket = Ticket::create([
                                'order_id' => $order->id,
                                'ticket_lot_id' => $item['lot']->id,
                                'customer_id' => $customer->id,
                            ]);

                            $eventStart = $item['lot']->event_id === $event->id ? $event->starts_at : null;
                            $alreadyStarted = $eventStart !== null && $eventStart->isPast();
                            $shouldRedeem = $alreadyStarted ? (mt_rand(1, 10) <= 8) : (mt_rand(1, 10) <= 2);

                            if ($shouldRedeem) {
                                $ticket->update(['used_at' => $createdAt->copy()->addDays(mt_rand(1, 5))]);
                            }
                        }
                    }
                }
            }
        }

        mt_srand($rng);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function events(): array
    {
        $defaultLots = fn (float $base) => [
            ['name' => '1º Lote', 'price' => $base, 'quantity' => 200, 'sales_end_at' => now()->addDays(5)],
            ['name' => '2º Lote', 'price' => round($base * 1.25, 2), 'quantity' => 200],
            ['name' => 'VIP', 'price' => round($base * 2.5, 2), 'quantity' => 60],
            ['name' => 'Meia entrada', 'price' => round($base / 2, 2), 'quantity' => 100, 'is_half_price' => true],
        ];

        return [
            [
                'name' => 'Festival de Verão 2026',
                'description' => 'Três dias de música ao ar livre com atrações nacionais e internacionais, food trucks e áreas de descanso.',
                'starts_at' => now()->addDays(30),
                'ends_at' => now()->addDays(32),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Parque Ibirapuera',
                'venue_address' => 'Av. Pedro Álvares Cabral - Vila Mariana, São Paulo/SP',
                'banner_url' => 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1600&q=80',
                'is_featured' => true,
                'lots' => $defaultLots(150),
            ],
            [
                'name' => 'Rock in Rio Experience',
                'description' => 'Uma noite épica com o melhor do rock nacional e grandes bandas internacionais.',
                'starts_at' => now()->addDays(45),
                'ends_at' => now()->addDays(45)->addHours(6),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Allianz Parque',
                'venue_address' => 'Rua Palestra Itália, 200 - Perdizes, São Paulo/SP',
                'banner_url' => 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1600&q=80',
                'is_featured' => true,
                'lots' => $defaultLots(220),
            ],
            [
                'name' => 'Workshop de Produção Musical Online',
                'description' => 'Aprenda técnicas de mixagem e mastering com produtores premiados da indústria.',
                'starts_at' => now()->addDays(7),
                'ends_at' => now()->addDays(7)->addHours(4),
                'venue_type' => VenueType::Online->value,
                'online_url' => 'https://meet.example.com/ticketeira-prod-musical',
                'banner_url' => 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1600&q=80',
                'lots' => [
                    ['name' => 'Participação', 'price' => 120.00, 'quantity' => 300],
                    ['name' => 'Mentoria VIP', 'price' => 450.00, 'quantity' => 20],
                ],
            ],
            [
                'name' => 'Noite de Stand-Up Comedy',
                'description' => 'Uma noite de muitas risadas com os melhores comediantes de São Paulo.',
                'starts_at' => now()->addDays(14),
                'ends_at' => now()->addDays(14)->addHours(3),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Teatro Renaissance',
                'venue_address' => 'Alameda Santos, 2233 - Cerqueira César, São Paulo/SP',
                'banner_url' => 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=1600&q=80',
                'lots' => $defaultLots(80),
            ],
            [
                'name' => 'Festival Gastronômico Internacional',
                'description' => 'Mais de 40 chefs renomados em um fim de semana de alta gastronomia com degustações, aulas e painéis.',
                'starts_at' => now()->addDays(21),
                'ends_at' => now()->addDays(23),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Jockey Club de São Paulo',
                'venue_address' => 'Av. Lineu de Paula Machado, 1263 - Cidade Jardim',
                'banner_url' => 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600&q=80',
                'is_featured' => true,
                'lots' => $defaultLots(180),
            ],
            [
                'name' => 'Eletrônica Sunset Party',
                'description' => 'DJs nacionais e internacionais em uma festa open air com pôr do sol e produção visual imersiva.',
                'starts_at' => now()->addDays(10),
                'ends_at' => now()->addDays(11),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Green Valley',
                'venue_address' => 'Rod. Interpraias, 4777 - Camboriú/SC',
                'banner_url' => 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&q=80',
                'lots' => $defaultLots(200),
            ],
            [
                'name' => 'Samba & Pagode — Roda de Bamba',
                'description' => 'Uma roda de samba raiz com grandes nomes e participação especial de bambas do gênero.',
                'starts_at' => now()->addDays(8),
                'ends_at' => now()->addDays(8)->addHours(6),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Vila Madalena',
                'venue_address' => 'R. Aspicuelta, 450 - Vila Madalena, São Paulo/SP',
                'banner_url' => 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1600&q=80',
                'lots' => $defaultLots(70),
            ],
            [
                'name' => 'TEDxSãoPaulo 2026',
                'description' => 'Ideias que valem a pena espalhar. Palestras inspiradoras de líderes, cientistas e artistas.',
                'starts_at' => now()->addDays(40),
                'ends_at' => now()->addDays(40)->addHours(8),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Teatro B32',
                'venue_address' => 'Av. Brigadeiro Faria Lima, 3732',
                'banner_url' => 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1600&q=80',
                'is_featured' => true,
                'lots' => [
                    ['name' => 'Ingresso Regular', 'price' => 450.00, 'quantity' => 400],
                    ['name' => 'Ingresso Premium', 'price' => 950.00, 'quantity' => 80],
                    ['name' => 'Estudante (meia)', 'price' => 225.00, 'quantity' => 150, 'is_half_price' => true],
                ],
            ],
            [
                'name' => 'Jazz na Praça',
                'description' => 'Tardes de jazz ao ar livre com quartetos, quintetos e participações surpresa.',
                'starts_at' => now()->addDays(18),
                'ends_at' => now()->addDays(18)->addHours(5),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Praça Benedito Calixto',
                'venue_address' => 'Pinheiros, São Paulo/SP',
                'banner_url' => 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1600&q=80',
                'lots' => $defaultLots(50),
            ],
            [
                'name' => 'Sertanejo na Arena',
                'description' => 'Os maiores hits do sertanejo universitário em uma noite inesquecível.',
                'starts_at' => now()->addDays(60),
                'ends_at' => now()->addDays(60)->addHours(5),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Arena MRV',
                'venue_address' => 'Belo Horizonte/MG',
                'banner_url' => 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1600&q=80',
                'lots' => $defaultLots(130),
            ],
            [
                'name' => 'Corrida Noturna 10k',
                'description' => 'Percurso pela orla com hidratação, DJ e after party após a chegada.',
                'starts_at' => now()->addDays(25),
                'ends_at' => now()->addDays(25)->addHours(3),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Marina da Glória',
                'venue_address' => 'Rio de Janeiro/RJ',
                'banner_url' => 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1600&q=80',
                'lots' => [
                    ['name' => 'Kit Atleta', 'price' => 120.00, 'quantity' => 500],
                    ['name' => 'Kit Premium', 'price' => 220.00, 'quantity' => 100],
                ],
            ],
            [
                'name' => 'Conferência de Startups SP',
                'description' => 'Três palcos, 80 palestrantes e rodadas de networking com investidores anjo e VCs.',
                'starts_at' => now()->addDays(35),
                'ends_at' => now()->addDays(37),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Transamerica Expo Center',
                'venue_address' => 'Av. Dr. Mário Vilas Boas Rodrigues, 387',
                'banner_url' => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80',
                'lots' => [
                    ['name' => 'Pass Dia Único', 'price' => 350.00, 'quantity' => 500],
                    ['name' => 'Pass Completo', 'price' => 899.00, 'quantity' => 300],
                    ['name' => 'Pass VIP', 'price' => 1890.00, 'quantity' => 80],
                ],
            ],
            [
                'name' => 'Teatro: O Avarento',
                'description' => 'Clássico de Molière em nova montagem contemporânea com elenco premiado.',
                'starts_at' => now()->addDays(12),
                'ends_at' => now()->addDays(12)->addHours(2),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Teatro Cultura Artística',
                'venue_address' => 'Rua Nestor Pestana, 196',
                'banner_url' => 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1600&q=80',
                'lots' => $defaultLots(90),
            ],
            [
                'name' => 'Festival de Cinema Independente',
                'description' => 'Uma semana de cinema autoral nacional e internacional, com debates e masterclasses.',
                'starts_at' => now()->addDays(28),
                'ends_at' => now()->addDays(34),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Cine Belas Artes',
                'venue_address' => 'Rua da Consolação, 2423',
                'banner_url' => 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&q=80',
                'lots' => [
                    ['name' => 'Sessão Individual', 'price' => 35.00, 'quantity' => 500],
                    ['name' => 'Passe Semana', 'price' => 220.00, 'quantity' => 150],
                    ['name' => 'Estudante (meia)', 'price' => 17.50, 'quantity' => 200, 'is_half_price' => true],
                ],
            ],
            [
                'name' => 'Workshop de Fotografia Noturna',
                'description' => 'Aula prática em campo com rolês noturnos, tripé e edição em RAW.',
                'starts_at' => now()->addDays(6),
                'ends_at' => now()->addDays(6)->addHours(5),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Estúdio Lumière',
                'venue_address' => 'Pinheiros, São Paulo/SP',
                'banner_url' => 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1600&q=80',
                'lots' => [
                    ['name' => 'Turma padrão', 'price' => 280.00, 'quantity' => 20],
                    ['name' => 'Turma com mentoria', 'price' => 580.00, 'quantity' => 8],
                ],
            ],
            [
                'name' => 'Expo Design & Arquitetura',
                'description' => 'Mostra de tendências em design de interiores, mobiliário autoral e arquitetura sustentável.',
                'starts_at' => now()->addDays(22),
                'ends_at' => now()->addDays(26),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Oca - Parque Ibirapuera',
                'venue_address' => 'Parque Ibirapuera - São Paulo/SP',
                'banner_url' => 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80',
                'lots' => [
                    ['name' => 'Ingresso Diário', 'price' => 65.00, 'quantity' => 800],
                    ['name' => 'Passe Completo', 'price' => 210.00, 'quantity' => 200],
                ],
            ],
            [
                'name' => 'Show Acústico Íntimo',
                'description' => 'Formato intimista com poucas mesas, repertório autoral e covers acústicos.',
                'starts_at' => now()->addDays(5),
                'ends_at' => now()->addDays(5)->addHours(3),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Blue Note São Paulo',
                'venue_address' => 'Conjunto Nacional - Av. Paulista, 2073',
                'banner_url' => 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&q=80',
                'lots' => [
                    ['name' => 'Mesa para 2', 'price' => 280.00, 'quantity' => 40],
                    ['name' => 'Mesa para 4', 'price' => 520.00, 'quantity' => 15],
                ],
            ],
            [
                'name' => 'Masterclass de Vinhos',
                'description' => 'Degustação guiada por sommelier com 8 rótulos de 4 regiões vitivinícolas.',
                'starts_at' => now()->addDays(9),
                'ends_at' => now()->addDays(9)->addHours(3),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Adega Santos',
                'venue_address' => 'Jardins, São Paulo/SP',
                'banner_url' => 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1600&q=80',
                'lots' => [
                    ['name' => 'Participação', 'price' => 320.00, 'quantity' => 24],
                ],
            ],
            [
                'name' => 'Yoga ao Amanhecer',
                'description' => 'Aula aberta para todos os níveis com vista para o nascer do sol e chá após a prática.',
                'starts_at' => now()->addDays(3),
                'ends_at' => now()->addDays(3)->addHours(2),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Parque do Povo',
                'venue_address' => 'Itaim Bibi, São Paulo/SP',
                'banner_url' => 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600&q=80',
                'lots' => [
                    ['name' => 'Aula aberta', 'price' => 45.00, 'quantity' => 100],
                    ['name' => 'Aula + Kit', 'price' => 120.00, 'quantity' => 40],
                ],
            ],
            [
                'name' => 'Hackathon de IA Generativa',
                'description' => '48 horas de código, mentorias com especialistas e premiação de R$ 50.000.',
                'starts_at' => now()->addDays(50),
                'ends_at' => now()->addDays(52),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Cubo Itaú',
                'venue_address' => 'Rua Casa do Ator, 919 - Vila Olímpia',
                'banner_url' => 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&q=80',
                'lots' => [
                    ['name' => 'Inscrição individual', 'price' => 150.00, 'quantity' => 300],
                    ['name' => 'Inscrição time', 'price' => 500.00, 'quantity' => 50],
                ],
            ],
            [
                'name' => 'Live Coding: Full Stack com Laravel + React',
                'description' => 'Evento online com construção ao vivo de uma aplicação completa do zero ao deploy.',
                'starts_at' => now()->addDays(4),
                'ends_at' => now()->addDays(4)->addHours(5),
                'venue_type' => VenueType::Online->value,
                'online_url' => 'https://meet.example.com/ticketeira-livecoding',
                'banner_url' => 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1600&q=80',
                'lots' => [
                    ['name' => 'Acesso online', 'price' => 79.00, 'quantity' => 1000],
                    ['name' => 'Acesso + Q&A privado', 'price' => 199.00, 'quantity' => 100],
                ],
            ],
            [
                'name' => 'Balé Contemporâneo — Noturno',
                'description' => 'Companhia premiada apresenta três coreografias inéditas com trilha executada ao vivo.',
                'starts_at' => now()->addDays(17),
                'ends_at' => now()->addDays(17)->addHours(2),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Theatro Municipal',
                'venue_address' => 'Praça Ramos de Azevedo, s/n',
                'banner_url' => 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=1600&q=80',
                'lots' => $defaultLots(110),
            ],
            [
                'name' => 'Festival de Cerveja Artesanal',
                'description' => 'Mais de 60 cervejarias em um parque com chopes, comidas típicas e bandas ao vivo.',
                'starts_at' => now()->addDays(38),
                'ends_at' => now()->addDays(40),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Parque Villa-Lobos',
                'venue_address' => 'Av. Prof. Fonseca Rodrigues, 1655',
                'banner_url' => 'https://images.unsplash.com/photo-1505075106905-fb052892c116?w=1600&q=80',
                'lots' => [
                    ['name' => 'Ingresso + Copo oficial', 'price' => 85.00, 'quantity' => 1500],
                    ['name' => 'Combo Dupla', 'price' => 150.00, 'quantity' => 400],
                    ['name' => 'Meia entrada', 'price' => 42.50, 'quantity' => 300, 'is_half_price' => true],
                ],
            ],
        ];
    }
}
