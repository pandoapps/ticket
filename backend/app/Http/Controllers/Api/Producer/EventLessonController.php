<?php

namespace App\Http\Controllers\Api\Producer;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Producer\StoreLessonRequest;
use App\Http\Requests\Producer\UpdateLessonRequest;
use App\Http\Resources\EventLessonResource;
use App\Models\EventLesson;
use App\Models\EventModule;
use App\Models\Producer;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventLessonController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function store(StoreLessonRequest $request, EventModule $module): JsonResponse
    {
        $this->authorizeOwnership($request, $module);

        $lesson = $module->lessons()->create([
            ...$request->validated(),
            'sort_order' => $request->integer('sort_order') ?: ($module->lessons()->max('sort_order') ?? 0) + 1,
        ]);
        $this->audit->log('event_lesson.created', $lesson);

        return response()->json(['data' => new EventLessonResource($lesson->load('materials'))], 201);
    }

    public function update(UpdateLessonRequest $request, EventLesson $lesson): JsonResponse
    {
        $this->authorizeOwnership($request, $lesson->module);

        $lesson->update($request->validated());
        $this->audit->log('event_lesson.updated', $lesson);

        return response()->json(['data' => new EventLessonResource($lesson->load('materials'))]);
    }

    public function destroy(Request $request, EventLesson $lesson): JsonResponse
    {
        $this->authorizeOwnership($request, $lesson->module);

        $lesson->delete();
        $this->audit->log('event_lesson.deleted', $lesson);

        return response()->json(null, 204);
    }

    private function producer(Request $request): Producer
    {
        return $request->attributes->get('producer') ?? $request->user()->producer()->firstOrFail();
    }

    private function authorizeOwnership(Request $request, EventModule $module): void
    {
        if ($request->user()?->role === UserRole::Admin) {
            return;
        }

        $producer = $this->producer($request);
        abort_if($module->event->producer_id !== $producer->id, 403, 'Módulo não pertence a este produtor.');
    }
}
