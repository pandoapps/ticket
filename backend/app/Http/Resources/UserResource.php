<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'cpf' => $this->cpf,
            'role' => $this->role?->value,
            'created_at' => self::utcIso($this->getRawOriginal('created_at')),
        ];
    }
}
