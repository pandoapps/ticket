<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'producer_id' => $this->producer_id,
            'slug' => $this->slug,
            'name' => $this->name,
            'description' => $this->description,
            'starts_at' => $this->starts_at?->toIso8601String(),
            'ends_at' => $this->ends_at?->toIso8601String(),
            'venue_type' => $this->venue_type?->value,
            'venue_name' => $this->venue_name,
            'venue_address' => $this->venue_address,
            'online_url' => $this->online_url,
            'banner_url' => $this->banner_url,
            'status' => $this->status?->value,
            'published_at' => $this->published_at?->toIso8601String(),
            'is_featured' => (bool) $this->is_featured,
            'producer' => new ProducerResource($this->whenLoaded('producer')),
            'lots' => TicketLotResource::collection($this->whenLoaded('lots')),
        ];
    }
}
