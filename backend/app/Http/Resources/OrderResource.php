<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    private static function utcIso(?string $raw): ?string
    {
        return $raw ? Carbon::createFromFormat('Y-m-d H:i:s', $raw, 'UTC')->toIso8601String() : null;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer' => new UserResource($this->whenLoaded('customer')),
            'event' => new EventResource($this->whenLoaded('event')),
            'subtotal' => (float) $this->subtotal,
            'discount_amount' => (float) $this->discount_amount,
            'discount_percent' => $this->discount_percent !== null ? (float) $this->discount_percent : null,
            'coupon_code' => $this->coupon_code,
            'platform_fee' => (float) $this->platform_fee,
            'total' => (float) $this->total,
            'payment_method' => $this->payment_method?->value,
            'sale_origin' => $this->sale_origin?->value,
            'status' => $this->status?->value,
            'checkout_url' => $this->abacate_checkout_url,
            'payment_token' => $this->payment_token,
            'pix_code' => $this->pix_code,
            'pix_qr_code' => $this->pix_qr_code,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'tickets' => TicketResource::collection($this->whenLoaded('tickets')),
            'paid_at' => self::utcIso($this->getRawOriginal('paid_at')),
            'cancelled_at' => self::utcIso($this->getRawOriginal('cancelled_at')),
            'expires_at' => self::utcIso($this->getRawOriginal('expires_at')),
            'created_at' => self::utcIso($this->getRawOriginal('created_at')),
        ];
    }
}
