<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
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
            'platform_fee' => (float) $this->platform_fee,
            'total' => (float) $this->total,
            'payment_method' => $this->payment_method?->value,
            'status' => $this->status?->value,
            'checkout_url' => $this->abacate_checkout_url,
            'pix_code' => $this->pix_code,
            'pix_qr_code' => $this->pix_qr_code,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'tickets' => TicketResource::collection($this->whenLoaded('tickets')),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),
            'expires_at' => $this->expires_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
