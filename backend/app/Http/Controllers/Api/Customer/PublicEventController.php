<?php

namespace App\Http\Controllers\Api\Customer;

use App\Enums\EventStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicEventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = $request->query('q');

        $query = Event::with(['producer', 'lots'])
            ->where('status', EventStatus::Published->value)
            ->where('starts_at', '>=', now())
            ->orderByDesc('is_featured')
            ->orderBy('starts_at');

        if (is_string($q) && $q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%")
                    ->orWhere('venue_name', 'like', "%{$q}%");
            });
        }

        $events = $query->paginate(12);

        return response()->json([
            'data' => EventResource::collection($events)->resolve(),
            'meta' => ['total' => $events->total(), 'page' => $events->currentPage()],
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $event = Event::with(['producer', 'lots'])
            ->where('slug', $slug)
            ->where('status', EventStatus::Published->value)
            ->firstOrFail();

        return response()->json(['data' => new EventResource($event)]);
    }
}
