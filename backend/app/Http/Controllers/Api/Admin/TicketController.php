<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(Request $request): JsonResponse
    {
        $query = Ticket::with(['customer', 'lot.event'])->latest();

        $status = $request->query('status');
        if ($status === 'used') {
            $query->whereNotNull('used_at');
        } elseif ($status === 'unused') {
            $query->whereNull('used_at');
        }

        if ($eventId = $request->query('event_id')) {
            $query->whereHas('lot', fn ($q) => $q->where('event_id', $eventId));
        }

        if ($search = $request->query('q')) {
            $query->whereHas('customer', fn ($sub) => $sub
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"));
        }

        $tickets = $query->paginate(30);

        $baseQuery = Ticket::query();
        $totalCount = (clone $baseQuery)->count();
        $usedCount = (clone $baseQuery)->whereNotNull('used_at')->count();

        return response()->json([
            'data' => collect($tickets->items())->map(fn (Ticket $ticket) => [
                'id' => $ticket->id,
                'code' => $ticket->code,
                'used_at' => $ticket->used_at?->toIso8601String(),
                'created_at' => $ticket->created_at?->toIso8601String(),
                'customer' => $ticket->customer ? [
                    'id' => $ticket->customer->id,
                    'name' => $ticket->customer->name,
                    'email' => $ticket->customer->email,
                ] : null,
                'lot' => $ticket->lot ? [
                    'id' => $ticket->lot->id,
                    'name' => $ticket->lot->name,
                    'price' => (float) $ticket->lot->price,
                ] : null,
                'event' => $ticket->lot?->event ? [
                    'id' => $ticket->lot->event->id,
                    'name' => $ticket->lot->event->name,
                ] : null,
            ])->values(),
            'meta' => [
                'total' => $tickets->total(),
                'page' => $tickets->currentPage(),
                'last_page' => $tickets->lastPage(),
                'stats' => [
                    'total' => $totalCount,
                    'used' => $usedCount,
                    'unused' => $totalCount - $usedCount,
                ],
            ],
        ]);
    }

    public function destroy(Ticket $ticket): JsonResponse
    {
        $this->audit->log('admin.ticket.deleted', $ticket);
        $ticket->delete();

        return response()->json(null, 204);
    }

    public function toggleUsed(Ticket $ticket): JsonResponse
    {
        if ($ticket->used_at) {
            $ticket->update(['used_at' => null]);
            $this->audit->log('admin.ticket.unmarked_used', $ticket);
        } else {
            $ticket->update(['used_at' => now()]);
            $this->audit->log('admin.ticket.marked_used', $ticket);
        }

        return response()->json([
            'data' => [
                'id' => $ticket->id,
                'used_at' => $ticket->used_at?->toIso8601String(),
            ],
        ]);
    }
}
