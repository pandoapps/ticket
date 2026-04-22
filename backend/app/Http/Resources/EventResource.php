<?php

namespace App\Http\Resources;

use App\Models\PlatformSetting;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $settings = PlatformSetting::current();

        return [
            'id' => $this->id,
            'producer_id' => $this->producer_id,
            'slug' => $this->slug,
            'name' => $this->name,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'starts_at' => $this->starts_at?->toIso8601String(),
            'ends_at' => $this->ends_at?->toIso8601String(),
            'venue_type' => $this->venue_type?->value,
            'venue_name' => $this->venue_name,
            'venue_address' => $this->venue_address,
            'online_url' => $this->online_url,
            'banner_url' => $this->banner_url,
            'header_url' => $this->header_url,
            'status' => $this->status?->value,
            'published_at' => $this->published_at?->toIso8601String(),
            'is_featured' => (bool) $this->is_featured,
            'accepts_pix' => (bool) $this->accepts_pix,
            'accepts_card' => (bool) $this->accepts_card,
            'platform_fees' => [
                'pix_percent' => (float) $settings->pix_commission_percent,
                'pix_fixed' => (float) $settings->pix_fixed_fee_cents,
                'card_percent' => (float) $settings->card_commission_percent,
                'card_fixed' => (float) $settings->card_fixed_fee_cents,
            ],
            'producer' => new ProducerResource($this->whenLoaded('producer')),
            'lots' => TicketLotResource::collection($this->whenLoaded('lots')),
        ];
    }
}
