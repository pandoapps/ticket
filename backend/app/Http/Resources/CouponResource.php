<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CouponResource extends JsonResource
{
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
            'discount_percent' => (float) $this->discount_percent,
            'max_uses' => $this->max_uses,
            'used_count' => (int) $this->used_count,
            'remaining_uses' => $this->max_uses !== null
                ? max(0, (int) $this->max_uses - (int) $this->used_count)
                : null,
            'starts_at' => $this->starts_at?->toIso8601String(),
            'ends_at' => $this->ends_at?->toIso8601String(),
            'is_active' => (bool) $this->is_active,
            'is_usable' => $this->isUsable(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
