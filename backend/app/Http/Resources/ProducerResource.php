<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProducerResource extends JsonResource
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
            'user_id' => $this->user_id,
            'company_name' => $this->company_name,
            'document' => $this->document,
            'phone' => $this->phone,
            'status' => $this->status?->value,
            'approved_at' => self::utcIso($this->getRawOriginal('approved_at')),
            'blocked_at' => self::utcIso($this->getRawOriginal('blocked_at')),
            'blocked_reason' => $this->blocked_reason,
            'has_valid_credentials' => $this->hasValidCredentials(),
            'user' => new UserResource($this->whenLoaded('user')),
            'created_at' => self::utcIso($this->getRawOriginal('created_at')),
        ];
    }
}
