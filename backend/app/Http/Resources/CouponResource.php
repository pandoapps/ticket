<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CouponResource extends JsonResource
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
            'event' => new EventResource($this->whenLoaded('event')),
            'producer_id' => $this->producer_id,
            'code' => $this->code,
            'discount_type' => $this->discount_type,
            'discount_percent' => $this->discount_percent !== null ? (float) $this->discount_percent : null,
            'discount_fixed' => $this->discount_fixed !== null ? (float) $this->discount_fixed : null,
            'max_uses' => $this->max_uses,
            'used_count' => (int) $this->used_count,
            'remaining_uses' => $this->max_uses !== null
                ? max(0, (int) $this->max_uses - (int) $this->used_count)
                : null,
            'starts_at' => self::utcIso($this->getRawOriginal('starts_at')),
            'ends_at' => self::utcIso($this->getRawOriginal('ends_at')),
            'is_active' => (bool) $this->is_active,
            'is_usable' => $this->isUsable(),
            'created_at' => self::utcIso($this->getRawOriginal('created_at')),
        ];
    }
}
