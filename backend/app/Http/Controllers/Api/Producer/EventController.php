<?php

namespace App\Http\Controllers\Api\Producer;

use App\Enums\EventStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Producer\StoreEventRequest;
use App\Http\Requests\Producer\UpdateEventRequest;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Models\Producer;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EventController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(Request $request): JsonResponse
    {
        $producer = $this->producer($request);
        $events = $producer->events()->with('lots')->orderByDesc('starts_at')->paginate(20);

        return response()->json([
            'data' => EventResource::collection($events)->resolve(),
            'meta' => ['total' => $events->total(), 'page' => $events->currentPage()],
        ]);
    }

    public function show(Request $request, Event $event): JsonResponse
    {
        $this->authorizeOwnership($request, $event);

        return response()->json(['data' => new EventResource($event->load('lots'))]);
    }

    public function store(StoreEventRequest $request): JsonResponse
    {
        $producer = $this->producer($request);

        $event = $producer->events()->create([
            ...$request->validated(),
            'slug' => $this->uniqueSlug($request->string('name')->toString()),
        ]);

        $this->audit->log('event.created', $event);

        return response()->json(['data' => new EventResource($event)], 201);
    }

    public function update(UpdateEventRequest $request, Event $event): JsonResponse
    {
        $this->authorizeOwnership($request, $event);
        $event->update($request->validated());
        $this->audit->log('event.updated', $event);

        return response()->json(['data' => new EventResource($event->load('lots'))]);
    }

    public function destroy(Request $request, Event $event): JsonResponse
    {
        $this->authorizeOwnership($request, $event);
        $event->delete();
        $this->audit->log('event.deleted', $event);

        return response()->json(null, 204);
    }

    public function publish(Request $request, Event $event): JsonResponse
    {
        $this->authorizeOwnership($request, $event);

        $producer = $this->producer($request);

        if (! $producer->hasValidCredentials()) {
            return response()->json([
                'message' => 'Configure e valide suas credenciais Abacate Pay antes de publicar.',
            ], 422);
        }

        if ($event->lots()->count() === 0) {
            return response()->json([
                'message' => 'Adicione ao menos um ingresso antes de publicar.',
            ], 422);
        }

        $event->update([
            'status' => EventStatus::Published->value,
            'published_at' => now(),
        ]);

        $this->audit->log('event.published', $event);

        return response()->json(['data' => new EventResource($event->load('lots'))]);
    }

    public function unpublish(Request $request, Event $event): JsonResponse
    {
        $this->authorizeOwnership($request, $event);

        $event->update([
            'status' => EventStatus::Draft->value,
            'published_at' => null,
        ]);

        $this->audit->log('event.unpublished', $event);

        return response()->json(['data' => new EventResource($event->load('lots'))]);
    }

    private function producer(Request $request): Producer
    {
        return $request->attributes->get('producer') ?? $request->user()->producer()->firstOrFail();
    }

    private function authorizeOwnership(Request $request, Event $event): void
    {
        $producer = $this->producer($request);
        abort_if($event->producer_id !== $producer->id, 403, 'Evento não pertence a este produtor.');
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $n = 1;
        while (Event::where('slug', $slug)->exists()) {
            $slug = $base.'-'.(++$n);
        }

        return $slug;
    }
}
