<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\AbacatePay\AbacatePayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicPaymentController extends Controller
{
    public function __construct(private readonly AbacatePayService $abacate) {}

    public function show(string $token): JsonResponse
    {
        $order = Order::with(['event', 'items.lot', 'customer'])
            ->where('payment_token', $token)
            ->firstOrFail();

        return response()->json(['data' => $this->serialize($order)]);
    }

    public function charge(Request $request, string $token): JsonResponse
    {
        $order = Order::with(['event', 'items.lot', 'customer', 'producer.credentials'])
            ->where('payment_token', $token)
            ->firstOrFail();

        if ($order->status === OrderStatus::Paid) {
            return response()->json(['data' => $this->serialize($order)]);
        }

        abort_if($order->status === OrderStatus::Cancelled, 422, 'Este pedido foi cancelado.');
        abort_if($order->status === OrderStatus::Expired, 422, 'Este pedido expirou.');
        abort_unless($order->producer->hasValidCredentials(), 422, 'Produtor sem credenciais de pagamento válidas.');

        $request->validate([
            'method' => ['required', 'in:pix,card'],
            'phone' => ['required_if:method,pix', 'nullable', 'string', 'max:20'],
            'cpf' => ['required_if:method,pix', 'nullable', 'string', 'max:14'],
        ]);

        $method = PaymentMethod::from($request->string('method')->toString());

        $customer = $order->customer;

        if ($method === PaymentMethod::Pix) {
            $phoneRaw = preg_replace('/\D+/', '', (string) $request->input('phone', ''));
            $cpfRaw = preg_replace('/\D+/', '', (string) $request->input('cpf', ''));
            $updates = [];
            if (empty($customer->phone) && $phoneRaw !== '') {
                $updates['phone'] = $phoneRaw;
            }
            if (empty($customer->cpf) && $cpfRaw !== '') {
                $updates['cpf'] = $cpfRaw;
            }
            if ($updates !== []) {
                $customer->fill($updates)->save();
                $customer->refresh();
                $order->setRelation('customer', $customer);
            }
        }

        $order->update(['payment_method' => $method]);

        if ($method === PaymentMethod::Card) {
            $charge = $this->abacate->createCardChargeForOrder($order);
            $order->update([
                'abacate_charge_id' => $charge['charge_id'],
                'abacate_checkout_url' => $charge['checkout_url'],
            ]);
        } else {
            $charge = $this->abacate->createPixChargeForOrder($order);
            $order->update([
                'abacate_charge_id' => $charge['charge_id'],
                'pix_code' => $charge['pix_code'],
                'pix_qr_code' => $charge['pix_qr_code'],
            ]);
        }

        $order->payments()->create([
            'gateway' => 'abacate_pay',
            'gateway_charge_id' => $charge['charge_id'],
            'amount' => $order->total,
            'payload' => $charge['raw'],
        ]);

        return response()->json(['data' => $this->serialize($order->fresh(['event', 'items.lot', 'customer']))]);
    }

    private function serialize(Order $order): array
    {
        return [
            'id' => $order->id,
            'status' => $order->status?->value,
            'payment_method' => $order->payment_method?->value,
            'total' => (float) $order->total,
            'subtotal' => (float) $order->subtotal,
            'platform_fee' => (float) $order->platform_fee,
            'discount_amount' => (float) $order->discount_amount,
            'expires_at' => $order->expires_at?->toIso8601String(),
            'pix_code' => $order->pix_code,
            'pix_qr_code' => $order->pix_qr_code,
            'checkout_url' => $order->abacate_checkout_url,
            'paid_at' => $order->paid_at?->toIso8601String(),
            'customer' => $order->customer ? ['name' => $order->customer->name] : null,
            'event' => $order->event ? [
                'name' => $order->event->name,
                'starts_at' => $order->event->starts_at,
                'venue_name' => $order->event->venue_name,
            ] : null,
            'items' => $order->items->map(fn ($item) => [
                'name' => $item->lot?->name,
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'subtotal' => (float) $item->subtotal,
            ])->values(),
        ];
    }
}
