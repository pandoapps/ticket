<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Manually issued tickets used to have no order; the members area grants
     * access through paid orders, so each orphan ticket gets a zero-value
     * paid order retroactively.
     */
    public function up(): void
    {
        $tickets = DB::table('tickets')
            ->join('ticket_lots', 'ticket_lots.id', '=', 'tickets.ticket_lot_id')
            ->join('events', 'events.id', '=', 'ticket_lots.event_id')
            ->whereNull('tickets.order_id')
            ->whereNull('tickets.deleted_at')
            ->whereNotNull('tickets.customer_id')
            ->select([
                'tickets.id as ticket_id',
                'tickets.customer_id',
                'tickets.created_at as issued_at',
                'ticket_lots.id as lot_id',
                'events.id as event_id',
                'events.producer_id',
            ])
            ->get();

        foreach ($tickets as $ticket) {
            DB::transaction(function () use ($ticket) {
                $now = now();

                $orderId = DB::table('orders')->insertGetId([
                    'customer_id' => $ticket->customer_id,
                    'producer_id' => $ticket->producer_id,
                    'event_id' => $ticket->event_id,
                    'subtotal' => 0,
                    'discount_amount' => 0,
                    'platform_fee' => 0,
                    'total' => 0,
                    'payment_method' => 'manual',
                    'sale_origin' => 'admin',
                    'status' => 'paid',
                    'paid_at' => $ticket->issued_at ?? $now,
                    'created_at' => $ticket->issued_at ?? $now,
                    'updated_at' => $now,
                ]);

                DB::table('order_items')->insert([
                    'order_id' => $orderId,
                    'ticket_lot_id' => $ticket->lot_id,
                    'quantity' => 1,
                    'unit_price' => 0,
                    'subtotal' => 0,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                DB::table('tickets')
                    ->where('id', $ticket->ticket_id)
                    ->update(['order_id' => $orderId, 'updated_at' => $now]);
            });
        }
    }

    public function down(): void
    {
        // Data backfill; not reversible.
    }
};
