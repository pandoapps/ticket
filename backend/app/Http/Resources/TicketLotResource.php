<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketLotResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'event_id' => $this->event_id,
            'name' => $this->name,
            'price' => (float) $this->price,
            'quantity' => (int) $this->quantity,
            'sold' => (int) $this->sold,
            'available' => $this->available(),
            'sales_start_at' => $this->sales_start_at?->toIso8601String(),
            'sales_end_at' => $this->sales_end_at?->toIso8601String(),
            'is_half_price' => (bool) $this->is_half_price,
            'on_sale' => $this->isOnSale(),
            'abacate_product_id' => $this->abacate_product_id,
        ];
    }
}
