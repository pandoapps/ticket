<?php

namespace App\Http\Controllers\Api\Producer;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Services\QrCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function __construct(private readonly QrCodeService $qr) {}

    public function show(Request $request, Ticket $ticket): JsonResponse
    {
        $producer = $request->attributes->get('producer') ?? $request->user()->producer()->firstOrFail();
        $ticket->load('lot.event');

        abort_if($ticket->lot->event->producer_id !== $producer->id, 403);

        return response()->json([
            'data' => [
                'id' => $ticket->id,
                'code' => $ticket->code,
                'qr_code' => $this->qr->pngDataUri($ticket->code),
                'used_at' => $ticket->used_at?->toIso8601String(),
            ],
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $producer = $request->attributes->get('producer') ?? $request->user()->producer()->firstOrFail();

        $query = Ticket::with(['customer', 'lot.event'])
            ->whereHas('lot.event', fn ($q) => $q->where('producer_id', $producer->id))
            ->latest();

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

        $baseQuery = Ticket::whereHas('lot.event', fn ($q) => $q->where('producer_id', $producer->id));
        $totalCount = (clone $baseQuery)->count();
        $usedCount = (clone $baseQuery)->whereNotNull('used_at')->count();

        return response()->json([
            'data' => collect($tickets->items())->map(fn (Ticket $ticket) => [
                'id' => $ticket->id,
                'code' => $ticket->code,
                'used_at' => $ticket->used_at?->toIso8601String(),
                'created_at' => $ticket->created_at?->toIso8601String(),
                'customer' => [
                    'id' => $ticket->customer->id,
                    'name' => $ticket->customer->name,
                    'email' => $ticket->customer->email,
                ],
                'lot' => [
                    'id' => $ticket->lot->id,
                    'name' => $ticket->lot->name,
                    'price' => (float) $ticket->lot->price,
                ],
                'event' => [
                    'id' => $ticket->lot->event->id,
                    'name' => $ticket->lot->event->name,
                    'starts_at' => $ticket->lot->event->starts_at?->toIso8601String(),
                    'venue_name' => $ticket->lot->event->venue_name,
                ],
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
}
