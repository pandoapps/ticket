<?php

namespace App\Http\Controllers\Api\Producer;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SalesController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $producer = $request->attributes->get('producer') ?? $request->user()->producer()->firstOrFail();

        $status = $request->query('status');

        $query = Order::with(['customer', 'event', 'items.lot'])
            ->where('producer_id', $producer->id)
            ->latest();

        if (is_string($status)) {
            $query->where('status', $status);
        }

        $orders = $query->paginate(20);

        return response()->json([
            'data' => OrderResource::collection($orders)->resolve(),
            'meta' => ['total' => $orders->total(), 'page' => $orders->currentPage()],
        ]);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        $producer = $request->attributes->get('producer') ?? $request->user()->producer()->firstOrFail();
        abort_if($order->producer_id !== $producer->id, 403);

        $order->load(['customer', 'event', 'items.lot', 'tickets.lot', 'payments']);

        return response()->json(['data' => new OrderResource($order)]);
    }

    public function summary(Request $request): JsonResponse
    {
        $producer = $request->attributes->get('producer') ?? $request->user()->producer()->firstOrFail();

        $orders = Order::where('producer_id', $producer->id);

        return response()->json([
            'data' => [
                'paid_total' => (float) (clone $orders)->where('status', OrderStatus::Paid)->sum('total'),
                'paid_count' => (clone $orders)->where('status', OrderStatus::Paid)->count(),
                'pending_count' => (clone $orders)->where('status', OrderStatus::Pending)->count(),
                'tickets_sold' => (clone $orders)->where('status', OrderStatus::Paid)->withCount('tickets')->get()->sum('tickets_count'),
            ],
        ]);
    }
}
