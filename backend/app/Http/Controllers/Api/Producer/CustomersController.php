<?php

namespace App\Http\Controllers\Api\Producer;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomersController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $producer = $request->attributes->get('producer') ?? $request->user()->producer()->firstOrFail();
        $producerId = $producer->id;

        $query = User::query()
            ->whereHas('orders', fn ($q) => $q->where('producer_id', $producerId))
            ->withCount([
                'orders as orders_count' => fn ($q) => $q->where('producer_id', $producerId),
                'orders as paid_orders_count' => fn ($q) => $q
                    ->where('producer_id', $producerId)
                    ->where('status', OrderStatus::Paid),
            ])
            ->withSum(
                ['orders as total_spent' => fn ($q) => $q
                    ->where('producer_id', $producerId)
                    ->where('status', OrderStatus::Paid)],
                'total',
            )
            ->withMax(
                ['orders as last_order_at' => fn ($q) => $q->where('producer_id', $producerId)],
                'created_at',
            )
            ->withMax(
                ['orders as last_paid_at' => fn ($q) => $q
                    ->where('producer_id', $producerId)
                    ->where('status', OrderStatus::Paid)],
                'paid_at',
            );

        $search = trim((string) $request->query('q', ''));
        if ($search !== '') {
            $like = '%'.$search.'%';
            $query->where(function ($w) use ($like) {
                $w->where('name', 'like', $like)
                    ->orWhere('email', 'like', $like)
                    ->orWhere('cpf', 'like', $like)
                    ->orWhere('phone', 'like', $like);
            });
        }

        $sort = $request->query('sort', 'last_order');
        match ($sort) {
            'name' => $query->orderBy('name'),
            'total' => $query->orderByDesc('total_spent'),
            'orders' => $query->orderByDesc('orders_count'),
            default => $query->orderByDesc('last_order_at'),
        };

        $customers = $query->paginate(20);

        return response()->json([
            'data' => $customers->getCollection()->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone,
                'cpf' => $u->cpf,
                'orders_count' => (int) ($u->orders_count ?? 0),
                'paid_orders_count' => (int) ($u->paid_orders_count ?? 0),
                'total_spent' => (float) ($u->total_spent ?? 0),
                'last_order_at' => optional($u->last_order_at ? Carbon::parse($u->last_order_at) : null)?->toIso8601String(),
                'last_paid_at' => optional($u->last_paid_at ? Carbon::parse($u->last_paid_at) : null)?->toIso8601String(),
                'created_at' => $u->created_at?->toIso8601String(),
            ])->values(),
            'meta' => [
                'total' => $customers->total(),
                'page' => $customers->currentPage(),
                'last_page' => $customers->lastPage(),
                'per_page' => $customers->perPage(),
            ],
        ]);
    }
}
