<?php

namespace App\Http\Controllers\Api\Producer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Producer\StoreTicketLotRequest;
use App\Http\Resources\TicketLotResource;
use App\Models\Event;
use App\Models\TicketLot;
use App\Services\AbacatePay\AbacatePayService;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketLotController extends Controller
{
    public function __construct(
        private readonly AuditLogger $audit,
        private readonly AbacatePayService $abacate,
    ) {}

    public function index(Request $request, Event $event): JsonResponse
    {
        $this->authorizeEvent($request, $event);

        return response()->json([
            'data' => TicketLotResource::collection($event->lots)->resolve(),
        ]);
    }

    public function store(StoreTicketLotRequest $request, Event $event): JsonResponse
    {
        $this->authorizeEvent($request, $event);
        $lot = $event->lots()->create($request->validated());
        $this->audit->log('lot.created', $lot);

        return response()->json(['data' => new TicketLotResource($lot)], 201);
    }

    public function update(StoreTicketLotRequest $request, TicketLot $lot): JsonResponse
    {
        $this->authorizeLot($request, $lot);
        $lot->update($request->validated());
        $this->audit->log('lot.updated', $lot);

        return response()->json(['data' => new TicketLotResource($lot)]);
    }

    public function sync(Request $request, TicketLot $lot): JsonResponse
    {
        $this->authorizeLot($request, $lot);

        $this->abacate->syncProductForLot($lot);
        $this->audit->log('lot.synced', $lot);

        return response()->json(['data' => new TicketLotResource($lot->fresh())]);
    }

    public function destroy(Request $request, TicketLot $lot): JsonResponse
    {
        $this->authorizeLot($request, $lot);

        if ($lot->sold > 0) {
            return response()->json([
                'message' => 'Não é possível excluir um lote com ingressos vendidos.',
            ], 422);
        }

        $lot->delete();
        $this->audit->log('lot.deleted', $lot);

        return response()->json(null, 204);
    }

    private function authorizeEvent(Request $request, Event $event): void
    {
        $producer = $request->attributes->get('producer') ?? $request->user()->producer()->firstOrFail();
        abort_if($event->producer_id !== $producer->id, 403, 'Evento não pertence a este produtor.');
    }

    private function authorizeLot(Request $request, TicketLot $lot): void
    {
        $this->authorizeEvent($request, $lot->event);
    }
}
