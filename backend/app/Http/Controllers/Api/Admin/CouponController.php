<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCouponRequest;
use App\Http\Resources\CouponResource;
use App\Models\Coupon;
use App\Models\Event;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(Request $request): JsonResponse
    {
        $query = Coupon::with(['event.producer.user'])->latest();

        if ($eventId = $request->integer('event_id')) {
            $query->where('event_id', $eventId);
        }
        if ($producerId = $request->integer('producer_id')) {
            $query->where('producer_id', $producerId);
        }
        if ($q = $request->query('q')) {
            $query->where('code', 'like', '%'.$q.'%');
        }

        $coupons = $query->paginate(20);

        return response()->json([
            'data' => CouponResource::collection($coupons)->resolve(),
            'meta' => ['total' => $coupons->total(), 'page' => $coupons->currentPage()],
        ]);
    }

    public function store(StoreCouponRequest $request): JsonResponse
    {
        $data = $request->validated();
        $event = Event::findOrFail($data['event_id']);

        $data['producer_id'] = $event->producer_id;
        $coupon = Coupon::create($data);
        $this->audit->log('admin.coupon.created', $coupon);

        return response()->json(['data' => new CouponResource($coupon->fresh('event'))], 201);
    }

    public function show(Coupon $coupon): JsonResponse
    {
        return response()->json(['data' => new CouponResource($coupon->load('event.producer.user'))]);
    }

    public function update(StoreCouponRequest $request, Coupon $coupon): JsonResponse
    {
        $data = $request->validated();
        unset($data['event_id'], $data['producer_id']);

        $coupon->update($data);
        $this->audit->log('admin.coupon.updated', $coupon);

        return response()->json(['data' => new CouponResource($coupon->fresh('event'))]);
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        $coupon->delete();
        $this->audit->log('admin.coupon.deleted', $coupon);

        return response()->json(null, 204);
    }
}
