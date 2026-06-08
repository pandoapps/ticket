<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketLotResource extends JsonResource
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
            'event_id' => $this->event_id,
            'name' => $this->name,
            'price' => (float) $this->price,
            'quantity' => (int) $this->quantity,
            'sold' => (int) $this->sold,
            'available' => $this->available(),
            'sales_start_at' => self::utcIso($this->getRawOriginal('sales_start_at')),
            'sales_end_at' => self::utcIso($this->getRawOriginal('sales_end_at')),
            'is_half_price' => (bool) $this->is_half_price,
            'is_active' => (bool) $this->is_active,
            'on_sale' => $this->isOnSale(),
            'abacate_product_id' => $this->abacate_product_id,
        ];
    }
}
