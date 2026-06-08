<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
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
            'code' => $this->code,
            'lot' => new TicketLotResource($this->whenLoaded('lot')),
            'event' => new EventResource($this->whenLoaded('event')),
            'used_at' => self::utcIso($this->getRawOriginal('used_at')),
            'created_at' => self::utcIso($this->getRawOriginal('created_at')),
        ];
    }
}
