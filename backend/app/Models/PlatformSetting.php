<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformSetting extends Model
{
    protected $fillable = [
        'commission_percent',
        'fixed_fee_cents',
    ];

    protected function casts(): array
    {
        return [
            'commission_percent' => 'decimal:2',
            'fixed_fee_cents' => 'decimal:2',
        ];
    }

    public static function current(): self
    {
        return static::query()->firstOrCreate([], [
            'commission_percent' => 10.00,
            'fixed_fee_cents' => 0,
        ]);
    }
}
