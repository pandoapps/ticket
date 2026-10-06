<?php

namespace App\Http\Controllers\Api\Producer;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Producer\StoreModuleRequest;
use App\Http\Requests\Producer\UpdateModuleRequest;
use App\Http\Resources\EventModuleResource;
use App\Models\Event;
use App\Models\EventModule;
use App\Models\Producer;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventModuleController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function store(StoreModuleRequest $request, Event $event): JsonResponse
    {
        $this->authorizeOwnership($request, $event);

        $module = $event->modules()->create([
            ...$request->validated(),
            'sort_order' => $request->integer('sort_order') ?: ($event->modules()->max('sort_order') ?? 0) + 1,
        ]);
        $this->audit->log('event_module.created', $module);

        return response()->json(['data' => new EventModuleResource($module->load('lessons'))], 201);
    }

    public function update(UpdateModuleRequest $request, EventModule $module): JsonResponse
    {
        $this->authorizeOwnership($request, $module->event);

        $module->update($request->validated());
        $this->audit->log('event_module.updated', $module);

        return response()->json(['data' => new EventModuleResource($module->load('lessons.materials'))]);
    }

    public function destroy(Request $request, EventModule $module): JsonResponse
    {
        $this->authorizeOwnership($request, $module->event);

        $module->delete();
        $this->audit->log('event_module.deleted', $module);

        return response()->json(null, 204);
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
