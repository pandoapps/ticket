<?php

namespace App\Http\Controllers\Api\Producer;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Producer\CreatePosOrderRequest;
use App\Http\Resources\OrderResource;
use App\Mail\PaymentLinkMail;
use App\Models\Event;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\MailService;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class PosController extends Controller
{
    public function __construct(
        private readonly OrderService $orders,
        private readonly AuditLogger $audit,
        private readonly MailService $mailer,
    ) {}

    public function store(CreatePosOrderRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $event = Event::with('producer.credentials')->findOrFail($validated['event_id']);

        $producer = $request->attributes->get('producer');

        // Non-admin producers may only sell tickets for their own events.
        if ($producer !== null) {
            abort_if($event->producer_id !== $producer->id, 403, 'Evento não pertence a este produtor.');
        }

        $customer = $this->resolveCustomer($validated);

        $phoneRaw = preg_replace('/\D+/', '', (string) ($validated['customer_phone'] ?? ''));
        $cpfRaw = preg_replace('/\D+/', '', (string) ($validated['customer_cpf'] ?? ''));
        $updates = [];
        if (empty($customer->phone) && $phoneRaw !== '') {
            $updates['phone'] = $phoneRaw;
        }
        if (empty($customer->cpf) && $cpfRaw !== '') {
            $updates['cpf'] = $cpfRaw;
        }
        if ($updates !== []) {
            $customer->fill($updates)->save();
            $customer->refresh();
        }

        $mode = $validated['payment_mode'];

        if ($mode === 'link' && empty($validated['customer_id']) && empty($validated['customer_email'])) {
            abort(422, 'E-mail do cliente é obrigatório para enviar o link de pagamento.');
        }

        if ($mode === 'manual') {
            $order = $this->orders->createManualPosOrder(
                $customer,
                $event,
                $validated['items'],
                $validated['coupon_code'] ?? null,
            );
        } else {
            abort_unless($event->isPublished(), 422, 'Evento não está disponível para venda.');

            $order = $this->orders->createPosLinkOrder(
                $customer->fresh(),
                $event,
                $validated['items'],
                $validated['coupon_code'] ?? null,
            );

            $order->load(['event', 'items.lot']);

            if (! str_contains($customer->email, '@noreply.internal')) {
                $subject = 'Seu ingresso está quase garantido — '.($order->event?->name ?? '');
                $this->mailer->send(new PaymentLinkMail($order), $customer->email, $subject, 'payment_link', $customer->name, $order);
            }
        }

        $this->audit->log('order.pos_created', $order, ['mode' => $mode]);

        return response()->json(['data' => new OrderResource($order->load(['event', 'items.lot']))], 201);
    }

    private function resolveCustomer(array $validated): User
    {
        if (! empty($validated['customer_id'])) {
            return User::findOrFail($validated['customer_id']);
        }

        $email = strtolower(trim((string) ($validated['customer_email'] ?? '')));
        $name = trim((string) ($validated['customer_name'] ?? '')) ?: 'Cliente POS';

        if ($email === '') {
            return User::create([
                'name' => $name,
                'email' => 'pos-'.Str::uuid().'@noreply.internal',
                'password' => bcrypt(Str::random(20)),
                'role' => UserRole::Customer,
            ]);
        }

        $existing = User::where('email', $email)->first();

        if ($existing) {
            return $existing;
        }

        return User::create([
            'name' => $name,
            'email' => $email,
            'password' => bcrypt(Str::random(20)),
            'role' => UserRole::Customer,
        ]);
    }
}
