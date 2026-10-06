<?php

namespace App\Http\Controllers\Api\Producer;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\EventModuleResource;
use App\Models\Event;
use App\Models\Producer;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MembersAreaController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function show(Request $request, Event $event): JsonResponse
    {
        $this->authorizeOwnership($request, $event);
        $event->load('modules.lessons.materials');

        return response()->json([
            'data' => [
                'event_id' => $event->id,
                'event_name' => $event->name,
                'members_area_enabled' => (bool) $event->members_area_enabled,
                'modules' => EventModuleResource::collection($event->modules)->resolve(),
            ],
        ]);
    }

    public function toggle(Request $request, Event $event): JsonResponse
    {
        $this->authorizeOwnership($request, $event);

        if (! $event->members_area_enabled && ! $event->lessons()->exists()) {
            return response()->json([
                'message' => 'Adicione ao menos uma aula antes de liberar a área de membros.',
            ], 422);
        }

        $event->update(['members_area_enabled' => ! $event->members_area_enabled]);
        $this->audit->log($event->members_area_enabled ? 'event.members_area_enabled' : 'event.members_area_disabled', $event);

        return response()->json([
            'data' => ['members_area_enabled' => (bool) $event->members_area_enabled],
        ]);
    }

    private function producer(Request $request): Producer
    {
        return $request->attributes->get('producer') ?? $request->user()->producer()->firstOrFail();
    }

    private function authorizeOwnership(Request $request, Event $event): void
    {
        if ($request->user()?->role === UserRole::Admin) {
            return;
        }

        $producer = $this->producer($request);
        abort_if($event->producer_id !== $producer->id, 403, 'Evento não pertence a este produtor.');
    }
}
