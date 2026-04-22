<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformSetting extends Model
{
    protected $fillable = [
        'pix_commission_percent',
        'pix_fixed_fee_cents',
        'card_commission_percent',
        'card_fixed_fee_cents',
    ];

    protected function casts(): array
    {
        return [
            'pix_commission_percent' => 'decimal:2',
            'pix_fixed_fee_cents' => 'decimal:2',
            'card_commission_percent' => 'decimal:2',
            'card_fixed_fee_cents' => 'decimal:2',
        ];
    }

    public static function current(): self
    {
        return static::query()->firstOrCreate([], [
            'pix_commission_percent' => 10.00,
            'pix_fixed_fee_cents' => 0,
            'card_commission_percent' => 10.00,
            'card_fixed_fee_cents' => 0,
        ]);
    }
}
