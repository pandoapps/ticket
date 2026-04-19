<?php

namespace App\Http\Controllers\Api\Producer;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketRedemptionController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function redeem(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'uuid'],
        ]);

        $producer = $request->attributes->get('producer') ?? $request->user()->producer()->firstOrFail();

        $ticket = Ticket::with(['lot.event', 'customer'])
            ->where('code', $data['code'])
            ->first();

        if ($ticket === null) {
            return response()->json(['status' => 'invalid', 'message' => 'Ingresso não encontrado.'], 404);
        }

        if ($ticket->lot->event->producer_id !== $producer->id) {
            return response()->json(['status' => 'forbidden', 'message' => 'Ingresso não pertence aos seus eventos.'], 403);
        }

        if ($ticket->used_at !== null) {
            return response()->json([
                'status' => 'already_used',
                'message' => 'Ingresso já foi utilizado.',
                'data' => $this->ticketView($ticket),
            ], 409);
        }

        $ticket->update(['used_at' => now()]);
        $this->audit->log('ticket.redeemed', $ticket, ['code' => $ticket->code]);

        return response()->json([
            'status' => 'ok',
            'message' => 'Ingresso validado.',
            'data' => $this->ticketView($ticket->fresh(['lot.event', 'customer'])),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function ticketView(Ticket $ticket): array
    {
        return [
            'id' => $ticket->id,
            'code' => $ticket->code,
            'used_at' => $ticket->used_at?->toIso8601String(),
            'lot' => [
                'id' => $ticket->lot->id,
                'name' => $ticket->lot->name,
            ],
            'event' => [
                'id' => $ticket->lot->event->id,
                'name' => $ticket->lot->event->name,
                'starts_at' => $ticket->lot->event->starts_at?->toIso8601String(),
                'venue_name' => $ticket->lot->event->venue_name,
            ],
            'customer' => [
                'id' => $ticket->customer->id,
                'name' => $ticket->customer->name,
                'email' => $ticket->customer->email,
            ],
        ];
    }
}
