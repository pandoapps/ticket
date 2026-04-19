<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\EventStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateEventRequest;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(Request $request): JsonResponse
    {
        $query = Event::with(['producer.user', 'lots'])->latest('starts_at');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($q = $request->query('q')) {
            $query->where('name', 'like', "%{$q}%");
        }

        $events = $query->paginate(20);

        return response()->json([
            'data' => EventResource::collection($events)->resolve(),
            'meta' => ['total' => $events->total(), 'page' => $events->currentPage()],
        ]);
    }

    public function update(UpdateEventRequest $request, Event $event): JsonResponse
    {
        $data = $request->validated();
        $previousStatus = $event->status;
        $nextStatus = EventStatus::from($data['status']);

        $payload = $data;
        if ($nextStatus === EventStatus::Published && $previousStatus !== EventStatus::Published) {
            $payload['published_at'] = now();
        } elseif ($nextStatus !== EventStatus::Published) {
            $payload['published_at'] = null;
        }

        $event->update($payload);
        $this->audit->log('admin.event.updated', $event);

        return response()->json(['data' => new EventResource($event->fresh(['producer.user', 'lots']))]);
    }

    public function destroy(Event $event): JsonResponse
    {
        $event->delete();
        $this->audit->log('admin.event.deleted', $event);

        return response()->json(null, 204);
    }
}
