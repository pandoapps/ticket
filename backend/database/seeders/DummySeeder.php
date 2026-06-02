<?php

namespace Database\Seeders;

use App\Enums\AbacateEnvironment;
use App\Enums\EventStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\ProducerStatus;
use App\Enums\UserRole;
use App\Enums\VenueType;
use App\Models\Event;
use App\Models\Order;
use App\Models\Producer;
use App\Models\Ticket;
use App\Models\TicketLot;
use App\Models\User;
use App\Services\PricingService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DummySeeder extends Seeder
{
    public function run(): void
    {
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
                'secret_key' => 'abc_dev_htgHBeHSWDtxnhgc1RPqLjCU',
                'webhook_secret' => '23d3223d23dddds',
                'environment' => AbacateEnvironment::Sandbox->value,
                'validated_at' => now(),
            ],
        );

        TicketLot::withoutEvents(function () use ($producer) {
            $this->seedEvents($producer);
        });

        $this->seedCustomersAndOrders($producer);
    }

    private function seedEvents(Producer $producer): void
    {
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
                    'header_url' => $data['header_url'] ?? $data['banner_url'],
                    'is_featured' => $data['is_featured'] ?? false,
                    'accepts_pix' => $data['accepts_pix'] ?? true,
                    'accepts_card' => $data['accepts_card'] ?? true,
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

        $pricing = new PricingService;
        $events = Event::with('lots')->get();
        $rng = random_int(1, PHP_INT_MAX);
        mt_srand(42);

        foreach ($customers as $customer) {
            $purchases = mt_rand(1, 4);
            for ($i = 0; $i < $purchases; $i++) {
                $event = $events->random();
                $lots = $event->lots->filter(fn ($lot) => $lot->price > 0)->values();
                if ($lots->isEmpty()) {
                    continue;
                }

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

                $breakdown = $pricing->breakdown($subtotal, PaymentMethod::Pix);
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
            ['name' => 'Early Bird', 'price' => $base, 'quantity' => 200, 'sales_end_at' => now()->addDays(5)],
            ['name' => 'General Admission', 'price' => round($base * 1.25, 2), 'quantity' => 200],
            ['name' => 'VIP', 'price' => round($base * 2.5, 2), 'quantity' => 60],
            ['name' => 'Half Price', 'price' => round($base / 2, 2), 'quantity' => 100, 'is_half_price' => true],
        ];

        return [
            // ── MUSIC ────────────────────────────────────────────────────────
            [
                'name' => 'Summer Sound Festival 2026',
                'description' => 'Three days of non-stop live music across four stages featuring top national and international acts, food trucks, and camping areas.',
                'starts_at' => now()->addDays(30),
                'ends_at' => now()->addDays(32),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Ibirapuera Park',
                'venue_address' => 'Av. Pedro Álvares Cabral - Vila Mariana, São Paulo/SP',
                'banner_url' => 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1600&q=80',
                'is_featured' => true,
                'lots' => $defaultLots(150),
            ],
            [
                'name' => 'Heavy Metal Mayhem Night',
                'description' => 'An epic night of heavy metal featuring headline bands from Brazil and Europe, pyrotechnics, and wall-to-wall sound.',
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
                'name' => 'Electronic Music Summit',
                'description' => 'Two nights of cutting-edge electronic music. International DJs, immersive light shows, and an open-air dance floor until sunrise.',
                'starts_at' => now()->addDays(10),
                'ends_at' => now()->addDays(11),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Green Valley',
                'venue_address' => 'Rod. Interpraias, 4777 - Camboriú/SC',
                'banner_url' => 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&q=80',
                'is_featured' => true,
                'lots' => $defaultLots(200),
            ],
            [
                'name' => 'Jazz & Blues Weekend',
                'description' => 'Afternoons of jazz and blues in the open air with quartets, quintets, and surprise guest appearances.',
                'starts_at' => now()->addDays(18),
                'ends_at' => now()->addDays(18)->addHours(5),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Praça Benedito Calixto',
                'venue_address' => 'Pinheiros, São Paulo/SP',
                'banner_url' => 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1600&q=80',
                'lots' => $defaultLots(50),
            ],
            [
                'name' => 'Hip-Hop & R&B Live Showcase',
                'description' => 'The biggest names in hip-hop and R&B converge for one night of freestyle battles, live performances, and exclusive releases.',
                'starts_at' => now()->addDays(60),
                'ends_at' => now()->addDays(60)->addHours(5),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Arena MRV',
                'venue_address' => 'Belo Horizonte/MG',
                'banner_url' => 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1600&q=80',
                'lots' => $defaultLots(130),
            ],
            [
                'name' => 'Acoustic Souls — Intimate Concert',
                'description' => 'An intimate seated show with original songwriters performing unplugged sets and acoustic covers in a candlelit venue.',
                'starts_at' => now()->addDays(5),
                'ends_at' => now()->addDays(5)->addHours(3),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Blue Note São Paulo',
                'venue_address' => 'Conjunto Nacional - Av. Paulista, 2073',
                'banner_url' => 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&q=80',
                'lots' => [
                    ['name' => 'Table for 2', 'price' => 280.00, 'quantity' => 40],
                    ['name' => 'Table for 4', 'price' => 520.00, 'quantity' => 15],
                    ['name' => 'Standing VIP', 'price' => 180.00, 'quantity' => 30],
                ],
            ],
            [
                'name' => 'Indie Rock Block Party',
                'description' => 'A full day street festival celebrating the best of indie rock with five local and international acts, craft beer stands, and art installations.',
                'starts_at' => now()->addDays(14),
                'ends_at' => now()->addDays(14)->addHours(10),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Vila Madalena',
                'venue_address' => 'R. Aspicuelta, 450 - Vila Madalena, São Paulo/SP',
                'banner_url' => 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1600&q=80',
                'lots' => $defaultLots(70),
            ],
            [
                'name' => 'Classical Orchestra — Symphony Night',
                'description' => 'An award-winning orchestra performs three world-premiere compositions with a live choir and full string section.',
                'starts_at' => now()->addDays(17),
                'ends_at' => now()->addDays(17)->addHours(2),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Theatro Municipal',
                'venue_address' => 'Praça Ramos de Azevedo, s/n',
                'banner_url' => 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=1600&q=80',
                'lots' => $defaultLots(110),
            ],
            [
                'name' => 'Reggae Vibes Open Air',
                'description' => 'A laid-back open-air reggae festival with roots artists, sound system battles, and jerk food trucks under the stars.',
                'starts_at' => now()->addDays(8),
                'ends_at' => now()->addDays(8)->addHours(6),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Parque Villa-Lobos',
                'venue_address' => 'Av. Prof. Fonseca Rodrigues, 1655',
                'banner_url' => 'https://images.unsplash.com/photo-1505075106905-fb052892c116?w=1600&q=80',
                'lots' => $defaultLots(80),
            ],
            [
                'name' => 'Music Production Masterclass Online',
                'description' => 'Learn professional mixing and mastering techniques from award-winning producers. Includes lifetime access to session recordings.',
                'starts_at' => now()->addDays(7),
                'ends_at' => now()->addDays(7)->addHours(4),
                'venue_type' => VenueType::Online->value,
                'online_url' => 'https://meet.example.com/ticketeira-music-masterclass',
                'banner_url' => 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1600&q=80',
                'lots' => [
                    ['name' => 'Standard Access', 'price' => 120.00, 'quantity' => 300],
                    ['name' => 'VIP Mentorship', 'price' => 450.00, 'quantity' => 20],
                ],
            ],
            [
                'name' => 'K-Pop Night Live Experience',
                'description' => 'The ultimate K-pop concert experience featuring live performances, fan meetings, light stick zones, and exclusive merchandise drops.',
                'starts_at' => now()->addDays(38),
                'ends_at' => now()->addDays(38)->addHours(4),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Espaço das Américas',
                'venue_address' => 'Rua Tagipuru, 795 - Barra Funda, São Paulo/SP',
                'banner_url' => 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1600&q=80',
                'is_featured' => true,
                'lots' => [
                    ['name' => 'Early Bird', 'price' => 180.00, 'quantity' => 300, 'sales_end_at' => now()->addDays(5)],
                    ['name' => 'General Admission', 'price' => 240.00, 'quantity' => 500],
                    ['name' => 'Fan Meet VIP', 'price' => 650.00, 'quantity' => 80],
                    ['name' => 'Half Price', 'price' => 120.00, 'quantity' => 150, 'is_half_price' => true],
                ],
            ],
            [
                'name' => 'Country Road Concert Night',
                'description' => 'The biggest country hits in an unforgettable arena night with special guest artists and a rodeo-themed experience.',
                'starts_at' => now()->addDays(22),
                'ends_at' => now()->addDays(22)->addHours(5),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Jeunesse Arena',
                'venue_address' => 'Av. Embaixador Abelardo Bueno, 3401 - Barra da Tijuca, Rio de Janeiro/RJ',
                'banner_url' => 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1600&q=80',
                'lots' => $defaultLots(140),
            ],

            // ── COMBAT SPORTS ────────────────────────────────────────────────
            [
                'name' => 'MMA Grand Championship Night',
                'description' => 'Eight title bouts in one night. The best MMA fighters from Brazil, USA, and Europe clash in the most anticipated card of the year.',
                'starts_at' => now()->addDays(35),
                'ends_at' => now()->addDays(35)->addHours(5),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Ginásio do Ibirapuera',
                'venue_address' => 'Av. Pedro Álvares Cabral - Ibirapuera, São Paulo/SP',
                'banner_url' => 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=1600&q=80',
                'is_featured' => true,
                'lots' => [
                    ['name' => 'Early Bird', 'price' => 180.00, 'quantity' => 300, 'sales_end_at' => now()->addDays(5)],
                    ['name' => 'Ringside', 'price' => 650.00, 'quantity' => 80],
                    ['name' => 'VIP Lounge', 'price' => 1200.00, 'quantity' => 40],
                    ['name' => 'Half Price', 'price' => 90.00, 'quantity' => 100, 'is_half_price' => true],
                ],
            ],
            [
                'name' => 'Boxing Night of Champions',
                'description' => 'A world-class boxing card featuring five bouts including a WBC title defense. Doors open two hours early for the undercard.',
                'starts_at' => now()->addDays(28),
                'ends_at' => now()->addDays(28)->addHours(5),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Allianz Parque',
                'venue_address' => 'Rua Palestra Itália, 200 - Perdizes, São Paulo/SP',
                'banner_url' => 'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?w=1600&q=80',
                'is_featured' => true,
                'lots' => [
                    ['name' => 'General Admission', 'price' => 200.00, 'quantity' => 500],
                    ['name' => 'Ringside', 'price' => 750.00, 'quantity' => 60],
                    ['name' => 'VIP Open Bar', 'price' => 1400.00, 'quantity' => 30],
                    ['name' => 'Half Price', 'price' => 100.00, 'quantity' => 120, 'is_half_price' => true],
                ],
            ],
            [
                'name' => 'Brazilian Jiu-Jitsu Open Tournament',
                'description' => 'Open-weight and division brackets for all belt levels. Over 500 competitors expected. Spectator and competitor passes available.',
                'starts_at' => now()->addDays(21),
                'ends_at' => now()->addDays(22),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Ginásio Nilson Nelson',
                'venue_address' => 'Eixo Monumental - Brasília/DF',
                'banner_url' => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1600&q=80',
                'lots' => [
                    ['name' => 'Competitor Pass', 'price' => 150.00, 'quantity' => 600],
                    ['name' => 'Spectator Pass', 'price' => 40.00, 'quantity' => 800],
                    ['name' => 'VIP Competitor', 'price' => 300.00, 'quantity' => 80],
                ],
            ],
            [
                'name' => 'Kickboxing Showdown — Glory Series',
                'description' => 'Six kickboxing bouts including a regional title fight. Elite K-1 rules, full-contact action and knockout bonuses for the main event winner.',
                'starts_at' => now()->addDays(40),
                'ends_at' => now()->addDays(40)->addHours(4),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Centro de Convenções Rebouças',
                'venue_address' => 'Av. Dr. Enéas de Carvalho Aguiar, 23 - Pinheiros, São Paulo/SP',
                'banner_url' => 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1600&q=80',
                'lots' => $defaultLots(120),
            ],
            [
                'name' => 'Muay Thai Warriors Night',
                'description' => 'Ten bouts of authentic Muay Thai under traditional rules. Featuring WBC Muaythai ranked fighters and ceremonial Wai Kru Ram Muay opening.',
                'starts_at' => now()->addDays(25),
                'ends_at' => now()->addDays(25)->addHours(4),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Clube Atlético Paulistano',
                'venue_address' => 'R. Honduras, 1400 - Jardim América, São Paulo/SP',
                'banner_url' => 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1600&q=80',
                'lots' => $defaultLots(100),
            ],
            [
                'name' => 'Grappling & Wrestling Championship',
                'description' => 'No-gi grappling and freestyle wrestling championships across four weight classes. Submission-only overtime rules for the finals.',
                'starts_at' => now()->addDays(50),
                'ends_at' => now()->addDays(51),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Arena Carioca',
                'venue_address' => 'Rua Embaixador Abelardo Bueno, 300 - Barra da Tijuca, Rio de Janeiro/RJ',
                'banner_url' => 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&q=80',
                'lots' => [
                    ['name' => 'Competitor Pass', 'price' => 130.00, 'quantity' => 400],
                    ['name' => 'Spectator Day Pass', 'price' => 35.00, 'quantity' => 600],
                    ['name' => 'Weekend Spectator', 'price' => 60.00, 'quantity' => 300],
                ],
            ],
            [
                'name' => 'Combat Sports Seminar — Champions Edition',
                'description' => 'Online seminar with world champions covering striking, wrestling, and fight strategy. Q&A session included. Recording delivered within 48 hours.',
                'starts_at' => now()->addDays(12),
                'ends_at' => now()->addDays(12)->addHours(6),
                'venue_type' => VenueType::Online->value,
                'online_url' => 'https://meet.example.com/ticketeira-combat-seminar',
                'banner_url' => 'https://images.unsplash.com/photo-1503467913725-8484b65b0715?w=1600&q=80',
                'lots' => [
                    ['name' => 'Standard Access', 'price' => 199.00, 'quantity' => 500],
                    ['name' => 'VIP + Recording', 'price' => 399.00, 'quantity' => 100],
                ],
            ],
            [
                'name' => 'Amateur Boxing Tournament',
                'description' => 'Regional amateur boxing tournament sanctioned by the CBBOXE. Open to all weight classes from flyweight to heavyweight. Spectators welcome.',
                'starts_at' => now()->addDays(9),
                'ends_at' => now()->addDays(9)->addHours(8),
                'venue_type' => VenueType::Physical->value,
                'venue_name' => 'Associação Atletismo Paulista',
                'venue_address' => 'Rua da Consolação, 930 - Consolação, São Paulo/SP',
                'banner_url' => 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=1600&q=80',
                'lots' => [
                    ['name' => 'Competitor Entry', 'price' => 80.00, 'quantity' => 200],
                    ['name' => 'Spectator', 'price' => 25.00, 'quantity' => 500],
                ],
            ],
        ];
    }
}
