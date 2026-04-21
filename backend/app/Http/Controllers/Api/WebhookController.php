<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\AuditLogger;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        $chargeId = $payload['data']['checkout']['id']
            ?? $payload['data']['transparent']['id']
            ?? $payload['data']['billing']['id']
            ?? $payload['data']['id']
            ?? $payload['id']
            ?? null;
        $externalId = $payload['data']['checkout']['externalId']
            ?? $payload['data']['transparent']['externalId']
            ?? $payload['data']['billing']['externalId']
            ?? $payload['data']['externalId']
            ?? null;
        $status = $payload['data']['checkout']['status']
            ?? $payload['data']['transparent']['status']
            ?? $payload['data']['billing']['status']
            ?? $payload['data']['status']
            ?? $payload['status']
            ?? null;

        Log::info('AbacatePay webhook received', ['event' => $event, 'charge_id' => $chargeId, 'external_id' => $externalId, 'status' => $status]);

        $order = null;
        if (is_string($chargeId) && $chargeId !== '') {
            $order = Order::with('producer.credentials')->where('abacate_charge_id', $chargeId)->first();
        }
        if ($order === null && is_string($externalId) && $externalId !== '' && ctype_digit($externalId)) {
            $order = Order::with('producer.credentials')->whereKey((int) $externalId)->first();
        }
        if ($order === null) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        if ((! is_string($chargeId) || $chargeId === '') && $order->abacate_charge_id) {
            $chargeId = $order->abacate_charge_id;
        }
        if (! is_string($chargeId) || $chargeId === '') {
            return response()->json(['message' => 'Missing charge id.'], 400);
        }

        if (! $this->verifySignature($request, $payload, $order->producer?->credentials?->webhook_secret)) {
            Log::warning('AbacatePay webhook signature rejected', ['charge_id' => $chargeId, 'order_id' => $order->id]);

            return response()->json(['message' => 'Invalid webhook signature.'], 401);
        }

        $outcome = $this->resolveOutcome($event, $status);
        $paymentStatus = match ($outcome) {
            'paid' => PaymentStatus::Paid,
            'cancelled' => PaymentStatus::Cancelled,
            'expired' => PaymentStatus::Expired,
            'failed' => PaymentStatus::Failed,
            default => $this->mapPaymentStatus($status),
        };

        DB::transaction(function () use ($order, $chargeId, $event, $status, $outcome, $paymentStatus, $payload) {
            $locked = Order::whereKey($order->id)->lockForUpdate()->first();

            $locked->payments()->updateOrCreate(
                ['gateway' => 'abacate_pay', 'gateway_charge_id' => $chargeId],
                [
                    'status' => $paymentStatus,
                    'amount' => $locked->total,
                    'payload' => $payload,
                ],
            );

            if ($outcome === 'paid') {
                if ($locked->status !== OrderStatus::Paid) {
                    $this->orders->markOrderPaid($locked);
                    $this->audit->log('order.paid_webhook', $locked, ['charge_id' => $chargeId, 'event' => $event]);
                } else {
                    Log::info('AbacatePay webhook ignored (order already paid)', ['charge_id' => $chargeId, 'order_id' => $locked->id]);
                }
            } elseif ($outcome === 'cancelled' || $outcome === 'failed' || $outcome === 'expired') {
                if (! in_array($locked->status, [OrderStatus::Paid, OrderStatus::Cancelled, OrderStatus::Expired], true)) {
                    $reason = match ($outcome) {
                        'expired' => 'expired',
                        'failed' => 'failed',
                        default => strtolower((string) ($status ?: $event)),
                    };
                    $this->orders->cancelOrder($locked, $reason);
                    $auditAction = $outcome === 'expired' ? 'order.expired_webhook' : 'order.cancelled_webhook';
                    $this->audit->log($auditAction, $locked, ['charge_id' => $chargeId, 'event' => $event, 'status' => $status]);
                } else {
                    Log::info('AbacatePay webhook ignored (order already finalized)', ['charge_id' => $chargeId, 'order_id' => $locked->id, 'current_status' => $locked->status->value]);
                }
            }
        });

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

    private function resolveOutcome(mixed $event, mixed $status): string
    {
        $normalizedStatus = strtolower((string) $status);
        $normalizedEvent = strtolower((string) $event);

        if (in_array($normalizedStatus, ['paid', 'approved', 'confirmed'], true)) {
            return 'paid';
        }
        if ($normalizedStatus === 'expired') {
            return 'expired';
        }
        if (in_array($normalizedStatus, ['cancelled', 'canceled'], true)) {
            return 'cancelled';
        }
        if ($normalizedStatus === 'failed') {
            return 'failed';
        }

        if (in_array($normalizedEvent, ['checkout.completed', 'billing.paid', 'transparent.paid', 'payment.paid'], true)) {
            return 'paid';
        }
        if (in_array($normalizedEvent, ['billing.expired', 'checkout.expired', 'transparent.expired', 'payment.expired'], true)) {
            return 'expired';
        }
        if (in_array($normalizedEvent, ['checkout.cancelled', 'checkout.canceled', 'billing.cancelled', 'billing.canceled'], true)) {
            return 'cancelled';
        }
        if (in_array($normalizedEvent, ['checkout.failed', 'billing.failed', 'payment.failed'], true)) {
            return 'failed';
        }

        return 'unknown';
    }

    private function mapPaymentStatus(mixed $status): PaymentStatus
    {
        $normalized = strtolower((string) $status);

        return match ($normalized) {
            'paid', 'approved', 'confirmed' => PaymentStatus::Paid,
            'cancelled', 'canceled' => PaymentStatus::Cancelled,
            'expired' => PaymentStatus::Expired,
            'failed' => PaymentStatus::Failed,
            default => PaymentStatus::Pending,
        };
    }
}
