<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Models\Event;
use App\Models\Order;
use App\Models\Ticket;
use App\Models\TicketLot;
use App\Models\User;
use App\Services\AbacatePay\AbacatePayService;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(
        private readonly PricingService $pricing,
        private readonly AbacatePayService $abacate,
    ) {}

    /**
     * @param  array<int, array{ticket_lot_id: int, quantity: int}>  $items
     */
    public function createPendingOrder(User $customer, Event $event, array $items, PaymentMethod $method = PaymentMethod::Pix): Order
    {
        return DB::transaction(function () use ($customer, $event, $items, $method) {
            $subtotal = 0.0;
            $validated = [];

            foreach ($items as $item) {
                $lot = TicketLot::lockForUpdate()->findOrFail($item['ticket_lot_id']);
                abort_if($lot->event_id !== $event->id, 422, 'Ingresso não pertence ao evento.');
                abort_if(! $lot->is_active, 422, "Ingresso '{$lot->name}' está desativado.");
                abort_if(! $lot->isOnSale(), 422, "Ingresso '{$lot->name}' não está disponível.");
                abort_if($lot->available() < $item['quantity'], 422, "Quantidade indisponível para o ingresso '{$lot->name}'.");

                $unit = (float) $lot->price;
                $sub = $unit * $item['quantity'];
                $subtotal += $sub;

                $validated[] = [
                    'lot' => $lot,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unit,
                    'subtotal' => $sub,
                ];
            }

            $breakdown = $this->pricing->breakdown($subtotal, $method);

            $order = Order::create([
                'customer_id' => $customer->id,
                'producer_id' => $event->producer_id,
                'event_id' => $event->id,
                'subtotal' => $breakdown['subtotal'],
                'platform_fee' => $breakdown['platform_fee'],
                'total' => $breakdown['total'],
                'payment_method' => $method,
                'status' => OrderStatus::Pending,
                'expires_at' => now()->addMinutes(30),
            ]);

            foreach ($validated as $v) {
                $order->items()->create([
                    'ticket_lot_id' => $v['lot']->id,
                    'quantity' => $v['quantity'],
                    'unit_price' => $v['unit_price'],
                    'subtotal' => $v['subtotal'],
                ]);

                $v['lot']->increment('sold', $v['quantity']);
            }

            $loaded = $order->load(['customer', 'event', 'items.lot']);

            if ((float) $order->total <= 0.0) {
                $order->payments()->create([
                    'gateway' => 'free',
                    'gateway_charge_id' => null,
                    'amount' => 0,
                    'payload' => null,
                ]);

                return $this->markOrderPaid($order);
            }

            if ($method === PaymentMethod::Card) {
                $charge = $this->abacate->createCardChargeForOrder($loaded);
                $order->update([
                    'abacate_charge_id' => $charge['charge_id'],
                    'abacate_checkout_url' => $charge['checkout_url'],
                ]);
            } else {
                $charge = $this->abacate->createPixChargeForOrder($loaded);
                $order->update([
                    'abacate_charge_id' => $charge['charge_id'],
                    'pix_code' => $charge['pix_code'],
                    'pix_qr_code' => $charge['pix_qr_code'],
                ]);
            }

            $order->payments()->create([
                'gateway' => 'abacate_pay',
                'gateway_charge_id' => $charge['charge_id'],
                'amount' => $order->total,
                'payload' => $charge['raw'],
            ]);

            return $order;
        });
    }

    public function markOrderPaid(Order $order): Order
    {
        return DB::transaction(function () use ($order) {
            if ($order->status === OrderStatus::Paid) {
                return $order;
            }

            $order->update([
                'status' => OrderStatus::Paid,
                'paid_at' => now(),
            ]);

            foreach ($order->items()->with('lot')->get() as $item) {
                for ($i = 0; $i < $item->quantity; $i++) {
                    Ticket::create([
                        'order_id' => $order->id,
                        'ticket_lot_id' => $item->ticket_lot_id,
                        'customer_id' => $order->customer_id,
                    ]);
                }
            }

            return $order->fresh(['tickets']);
        });
    }

    public function cancelOrder(Order $order, string $reason = 'cancelled'): Order
    {
        return DB::transaction(function () use ($order, $reason) {
            if ($order->status === OrderStatus::Paid) {
                return $order;
            }

            $order->update([
                'status' => $reason === 'expired' ? OrderStatus::Expired : OrderStatus::Cancelled,
                'cancelled_at' => now(),
            ]);

            foreach ($order->items as $item) {
                $item->lot()->lockForUpdate()->first()?->decrement('sold', $item->quantity);
            }

            return $order->fresh();
        });
    }
}
