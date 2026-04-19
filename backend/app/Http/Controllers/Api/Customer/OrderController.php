<?php

namespace App\Http\Controllers\Api\Customer;

use App\Enums\PaymentMethod;
use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CreateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Event;
use App\Models\Order;
use App\Services\AuditLogger;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orders,
        private readonly AuditLogger $audit,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $orders = $request->user()
            ->orders()
            ->with(['event', 'items.lot', 'tickets.lot'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => OrderResource::collection($orders)->resolve(),
            'meta' => ['total' => $orders->total(), 'page' => $orders->currentPage()],
        ]);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        abort_if($order->customer_id !== $request->user()->id, 403);
        $order->load(['event', 'items.lot', 'tickets.lot', 'payments']);

        return response()->json(['data' => new OrderResource($order)]);
    }

    public function store(CreateOrderRequest $request): JsonResponse
    {
        $event = Event::with('producer.credentials')->findOrFail($request->integer('event_id'));

        abort_unless($event->isPublished(), 422, 'Evento não está disponível para compra.');
        abort_unless($event->producer->hasValidCredentials(), 422, 'Produtor sem credenciais de pagamento válidas.');

        $user = $request->user();
        $validated = $request->validated();

        $updates = [];
        if (empty($user->phone) && ! empty($validated['phone'])) {
            $updates['phone'] = preg_replace('/\D+/', '', (string) $validated['phone']);
        }
        if (empty($user->cpf) && ! empty($validated['cpf'])) {
            $updates['cpf'] = preg_replace('/\D+/', '', (string) $validated['cpf']);
        }
        if ($updates !== []) {
            $user->fill($updates)->save();
        }

        $order = $this->orders->createPendingOrder(
            $user->fresh(),
            $event,
            $validated['items'],
            PaymentMethod::from($validated['payment_method']),
        );

        $this->audit->log('order.created', $order);

        $order->load(['event', 'items.lot']);

        return response()->json(['data' => new OrderResource($order)], 201);
    }
}
