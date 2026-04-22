<?php

namespace App\Http\Controllers\Api\Producer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Producer\StoreCouponRequest;
use App\Http\Resources\CouponResource;
use App\Models\Coupon;
use App\Models\Event;
use App\Models\Producer;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(Request $request): JsonResponse
    {
        $producer = $this->currentProducer($request);

        $query = Coupon::with('event')
            ->where('producer_id', $producer->id)
            ->latest();

        if ($eventId = $request->integer('event_id')) {
            $query->where('event_id', $eventId);
        }

        $coupons = $query->paginate(20);

        return response()->json([
            'data' => CouponResource::collection($coupons)->resolve(),
            'meta' => ['total' => $coupons->total(), 'page' => $coupons->currentPage()],
        ]);
    }

    public function store(StoreCouponRequest $request): JsonResponse
    {
        $producer = $this->currentProducer($request);
        $data = $request->validated();
        $event = Event::findOrFail($data['event_id']);
        $this->assertOwnsEvent($producer, $event);

        $data['producer_id'] = $producer->id;
        $coupon = Coupon::create($data);
        $this->audit->log('coupon.created', $coupon);

        return response()->json(['data' => new CouponResource($coupon->fresh('event'))], 201);
    }

    public function show(Request $request, Coupon $coupon): JsonResponse
    {
        $this->authorizeCoupon($request, $coupon);

        return response()->json(['data' => new CouponResource($coupon->load('event'))]);
    }

    public function update(StoreCouponRequest $request, Coupon $coupon): JsonResponse
    {
        $this->authorizeCoupon($request, $coupon);

        $data = $request->validated();
        unset($data['event_id'], $data['producer_id']);

        $coupon->update($data);
        $this->audit->log('coupon.updated', $coupon);

        return response()->json(['data' => new CouponResource($coupon->fresh('event'))]);
    }

    public function destroy(Request $request, Coupon $coupon): JsonResponse
    {
        $this->authorizeCoupon($request, $coupon);

        $coupon->delete();
        $this->audit->log('coupon.deleted', $coupon);

        return response()->json(null, 204);
    }

    private function currentProducer(Request $request): Producer
    {
        return $request->attributes->get('producer') ?? $request->user()->producer()->firstOrFail();
    }

    private function assertOwnsEvent(Producer $producer, Event $event): void
    {
        abort_if($event->producer_id !== $producer->id, 403, 'Evento não pertence a este produtor.');
    }

    private function authorizeCoupon(Request $request, Coupon $coupon): void
    {
        $producer = $this->currentProducer($request);
        abort_if($coupon->producer_id !== $producer->id, 403, 'Cupom não pertence a este produtor.');
    }
}
