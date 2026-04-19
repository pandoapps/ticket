<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['customer', 'event', 'producer.user'])->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($q = $request->query('q')) {
            $query->where(function ($sub) use ($q) {
                $sub->where('id', $q)
                    ->orWhereHas('customer', fn ($c) => $c->where('name', 'like', "%{$q}%")->orWhere('email', 'like', "%{$q}%"))
                    ->orWhereHas('event', fn ($e) => $e->where('name', 'like', "%{$q}%"));
            });
        }

        $orders = $query->paginate(20);

        return response()->json([
            'data' => OrderResource::collection($orders)->resolve(),
            'meta' => ['total' => $orders->total(), 'page' => $orders->currentPage()],
        ]);
    }

    public function update(UpdateOrderRequest $request, Order $order): JsonResponse
    {
        $nextStatus = OrderStatus::from($request->validated()['status']);
        $previousStatus = $order->status;

        $payload = ['status' => $nextStatus];
        if ($nextStatus === OrderStatus::Paid && $previousStatus !== OrderStatus::Paid) {
            $payload['paid_at'] = $order->paid_at ?? now();
        } elseif ($nextStatus === OrderStatus::Cancelled && $previousStatus !== OrderStatus::Cancelled) {
            $payload['cancelled_at'] = $order->cancelled_at ?? now();
        }

        $order->update($payload);
        $this->audit->log('admin.order.updated', $order, ['from' => $previousStatus?->value, 'to' => $nextStatus->value]);

        return response()->json(['data' => new OrderResource($order->fresh(['customer', 'event']))]);
    }

    public function destroy(Order $order): JsonResponse
    {
        $order->delete();
        $this->audit->log('admin.order.deleted', $order);

        return response()->json(null, 204);
    }
}
