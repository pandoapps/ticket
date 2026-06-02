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
        'active_gateway',
        'abacatepay_public_key',
        'abacatepay_secret_key',
        'stripe_public_key',
        'stripe_secret_key',
        'mailgun_domain',
        'mailgun_secret',
        'mailgun_endpoint',
        'mail_from_address',
        'mail_from_name',
    ];

    protected $hidden = [
        'abacatepay_secret_key',
        'stripe_secret_key',
        'mailgun_secret',
    ];

    protected $appends = [
        'abacatepay_secret_key_set',
        'stripe_secret_key_set',
        'mailgun_secret_set',
    ];

    protected function casts(): array
    {
        return [
            'pix_commission_percent' => 'decimal:2',
            'pix_fixed_fee_cents' => 'decimal:2',
            'card_commission_percent' => 'decimal:2',
            'card_fixed_fee_cents' => 'decimal:2',
            'abacatepay_secret_key' => 'encrypted',
            'stripe_secret_key' => 'encrypted',
            'mailgun_secret' => 'encrypted',
        ];
    }

    public function getAbacatepaySecretKeySetAttribute(): bool
    {
        return ! empty($this->abacatepay_secret_key);
    }

    public function getStripeSecretKeySetAttribute(): bool
    {
        return ! empty($this->stripe_secret_key);
    }

    public function getMailgunSecretSetAttribute(): bool
    {
        return ! empty($this->mailgun_secret);
    }

    public function isMailConfigured(): bool
    {
        return ! empty($this->mailgun_domain) && ! empty($this->mailgun_secret) && ! empty($this->mail_from_address);
    }

    public static ?self $cached = null;

    public static function current(): self
    {
        return static::$cached ??= static::query()->firstOrCreate([], [
            'pix_commission_percent' => 10.00,
            'pix_fixed_fee_cents' => 0,
            'card_commission_percent' => 10.00,
            'card_fixed_fee_cents' => 0,
            'active_gateway' => 'abacate_pay',
        ]);
    }
}
