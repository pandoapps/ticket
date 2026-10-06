<?php

namespace App\Http\Controllers\Api\Producer;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Producer\StoreMaterialRequest;
use App\Http\Requests\Producer\UpdateMaterialRequest;
use App\Http\Resources\LessonMaterialResource;
use App\Models\EventLesson;
use App\Models\LessonMaterial;
use App\Models\Producer;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LessonMaterialController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function store(StoreMaterialRequest $request, EventLesson $lesson): JsonResponse
    {
        $this->authorizeOwnership($request, $lesson);

        $material = $lesson->materials()->create([
            ...$request->validated(),
            'sort_order' => $request->integer('sort_order') ?: ($lesson->materials()->max('sort_order') ?? 0) + 1,
        ]);
        $this->audit->log('lesson_material.created', $material);

        return response()->json(['data' => new LessonMaterialResource($material)], 201);
    }

    public function update(UpdateMaterialRequest $request, LessonMaterial $material): JsonResponse
    {
        $this->authorizeOwnership($request, $material->lesson);

        $material->update($request->validated());
        $this->audit->log('lesson_material.updated', $material);

        return response()->json(['data' => new LessonMaterialResource($material)]);
    }

    public function destroy(Request $request, LessonMaterial $material): JsonResponse
    {
        $this->authorizeOwnership($request, $material->lesson);

        $material->delete();
        $this->audit->log('lesson_material.deleted', $material);

        return response()->json(null, 204);
    }

    private function producer(Request $request): Producer
    {
        return $request->attributes->get('producer') ?? $request->user()->producer()->firstOrFail();
    }

    private function authorizeOwnership(Request $request, EventLesson $lesson): void
    {
        if ($request->user()?->role === UserRole::Admin) {
            return;
        }

        $producer = $this->producer($request);
        abort_if($lesson->module->event->producer_id !== $producer->id, 403, 'Aula não pertence a este produtor.');
    }
}
