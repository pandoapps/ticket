<?php

namespace App\Http\Controllers\Api;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\AuditLogger;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function __construct(
        private readonly OrderService $orders,
        private readonly AuditLogger $audit,
    ) {}

    public function abacatePay(Request $request): JsonResponse
    {
        $payload = $request->all();

        $event = $payload['event'] ?? $payload['type'] ?? null;
        $chargeId = $payload['data']['transparent']['id']
            ?? $payload['data']['billing']['id']
            ?? $payload['data']['id']
            ?? $payload['id']
            ?? null;
        $status = $payload['data']['transparent']['status']
            ?? $payload['data']['billing']['status']
            ?? $payload['data']['status']
            ?? $payload['status']
            ?? null;

        Log::info('AbacatePay webhook received', ['event' => $event, 'charge_id' => $chargeId, 'status' => $status]);

        if (! is_string($chargeId) || $chargeId === '') {
            return response()->json(['message' => 'Missing charge id.'], 400);
        }

        $order = Order::with('producer.credentials')->where('abacate_charge_id', $chargeId)->first();
        if ($order === null) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        if (! $this->verifySignature($request, $payload, $order->producer?->credentials?->webhook_secret)) {
            Log::warning('AbacatePay webhook signature rejected', ['charge_id' => $chargeId, 'order_id' => $order->id]);
            return response()->json(['message' => 'Invalid webhook signature.'], 401);
        }

        $order->payments()->create([
            'gateway' => 'abacate_pay',
            'gateway_charge_id' => $chargeId,
            'status' => $this->mapPaymentStatus($status),
            'amount' => $order->total,
            'payload' => $payload,
        ]);

        if (in_array($status, ['PAID', 'paid', 'approved', 'CONFIRMED'], true)) {
            $this->orders->markOrderPaid($order);
            $this->audit->log('order.paid_webhook', $order, ['charge_id' => $chargeId]);
        } elseif (in_array($status, ['CANCELLED', 'cancelled', 'EXPIRED', 'expired', 'FAILED', 'failed'], true)) {
            $this->orders->cancelOrder($order, strtolower((string) $status));
            $this->audit->log('order.cancelled_webhook', $order, ['charge_id' => $chargeId, 'status' => $status]);
        }

        return response()->json(['message' => 'ok']);
    }

    private function verifySignature(Request $request, array $payload, ?string $secret): bool
    {
        if ($secret === null || $secret === '') {
            return false;
        }

        $headerSecret = (string) $request->header('X-Webhook-Secret', '');
        if ($headerSecret !== '' && hash_equals($secret, $headerSecret)) {
            return true;
        }

        $querySecret = (string) $request->query('webhookSecret', '');
        if ($querySecret !== '' && hash_equals($secret, $querySecret)) {
            return true;
        }

        $bodySecret = $payload['webhookSecret'] ?? null;
        if (is_string($bodySecret) && $bodySecret !== '' && hash_equals($secret, $bodySecret)) {
            return true;
        }

        $signatureHeader = (string) $request->header('X-Webhook-Signature', '');
        if ($signatureHeader !== '') {
            $expected = base64_encode(hash_hmac('sha256', $request->getContent(), $secret, true));
            if (hash_equals($expected, $signatureHeader)) {
                return true;
            }
        }

        return false;
    }

    private function mapPaymentStatus(mixed $status): PaymentStatus
    {
        $normalized = strtolower((string) $status);
        return match ($normalized) {
            'paid', 'approved', 'confirmed' => PaymentStatus::Paid,
            'cancelled', 'canceled' => PaymentStatus::Cancelled,
            'failed' => PaymentStatus::Failed,
            default => PaymentStatus::Pending,
        };
    }
}
