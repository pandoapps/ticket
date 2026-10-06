<?php

namespace App\Http\Controllers\Api\Customer;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\EventModuleResource;
use App\Models\Event;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $events = Event::query()
            ->where('members_area_enabled', true)
            ->whereHas('orders', fn (Builder $query) => $this->paidByCustomer($query, $request->user()->id))
            ->withCount(['modules', 'lessons'])
            ->orderByDesc('updated_at')
            ->get();

        return response()->json([
            'data' => $events->map(fn (Event $event) => [
                'id' => $event->id,
                'slug' => $event->slug,
                'name' => $event->name,
                'short_description' => $event->short_description,
                'banner_url' => $event->banner_url,
                'header_url' => $event->header_url,
                'modules_count' => (int) $event->modules_count,
                'lessons_count' => (int) $event->lessons_count,
            ])->values(),
        ]);
    }

    public function show(Request $request, Event $event): JsonResponse
    {
        $hasAccess = $event->members_area_enabled
            && $event->orders()->where(fn (Builder $query) => $this->paidByCustomer($query, $request->user()->id))->exists();
        abort_unless($hasAccess, 403, 'Você não tem acesso a este curso.');

        $event->load('modules.lessons.materials');

        return response()->json([
            'data' => [
                'id' => $event->id,
                'slug' => $event->slug,
                'name' => $event->name,
                'description' => $event->description,
                'banner_url' => $event->banner_url,
                'header_url' => $event->header_url,
                'modules' => EventModuleResource::collection($event->modules)->resolve(),
            ],
        ]);
    }

    private function paidByCustomer(Builder $query, int $customerId): Builder
    {
        return $query->where('customer_id', $customerId)->where('status', OrderStatus::Paid->value);
    }
}
