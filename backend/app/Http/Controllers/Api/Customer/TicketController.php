<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Http\Resources\TicketLotResource;
use App\Models\Ticket;
use App\Services\QrCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function __construct(private readonly QrCodeService $qr) {}

    public function index(Request $request): JsonResponse
    {
        $tickets = Ticket::with(['lot.event.producer'])
            ->where('customer_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'data' => $tickets->map(fn (Ticket $ticket) => [
                'id' => $ticket->id,
                'code' => $ticket->code,
                'qr_code' => $this->qr->pngDataUri($ticket->code),
                'used_at' => $ticket->used_at?->toIso8601String(),
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
                    'banner_url' => $ticket->lot->event->banner_url,
                ],
            ])->values(),
        ]);
    }

    public function show(Request $request, Ticket $ticket): JsonResponse
    {
        abort_if($ticket->customer_id !== $request->user()->id, 403);
        $ticket->load('lot.event');

        return response()->json([
            'data' => [
                'id' => $ticket->id,
                'code' => $ticket->code,
                'qr_code' => $this->qr->pngDataUri($ticket->code),
                'used_at' => $ticket->used_at?->toIso8601String(),
                'lot' => new TicketLotResource($ticket->lot),
                'event' => new EventResource($ticket->lot->event),
            ],
        ]);
    }
}
