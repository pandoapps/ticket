<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\SaleOrigin;
use App\Models\Order;
use App\Models\Ticket;
use App\Models\TicketLot;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ManualTicketService
{
    /**
     * Issues a courtesy ticket backed by a zero-value paid order, so the
     * customer gains members-area access through the regular paid-order rule.
     */
    public function issue(User $customer, TicketLot $lot): Ticket
    {
        return DB::transaction(function () use ($customer, $lot) {
            $order = Order::create([
                'customer_id' => $customer->id,
                'producer_id' => $lot->event->producer_id,
                'event_id' => $lot->event_id,
                'subtotal' => 0,
                'discount_amount' => 0,
                'platform_fee' => 0,
                'total' => 0,
                'payment_method' => PaymentMethod::Manual,
                'sale_origin' => SaleOrigin::Admin,
                'status' => OrderStatus::Paid,
                'paid_at' => now(),
            ]);

            $order->items()->create([
                'ticket_lot_id' => $lot->id,
                'quantity' => 1,
                'unit_price' => 0,
                'subtotal' => 0,
            ]);

            $ticket = Ticket::create([
                'order_id' => $order->id,
                'ticket_lot_id' => $lot->id,
                'customer_id' => $customer->id,
            ]);

            $lot->increment('sold');

            return $ticket;
        });
    }
}
