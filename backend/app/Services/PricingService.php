<?php

namespace App\Services;

use App\Enums\PaymentMethod;
use App\Models\PlatformSetting;

class PricingService
{
    /**
     * @return array{subtotal: float, platform_fee: float, total: float}
     */
    public function breakdown(float $subtotal, PaymentMethod $method): array
    {
        $settings = PlatformSetting::current();

        [$percent, $fixed] = match ($method) {
            PaymentMethod::Pix => [(float) $settings->pix_commission_percent, (float) $settings->pix_fixed_fee_cents],
            PaymentMethod::Card => [(float) $settings->card_commission_percent, (float) $settings->card_fixed_fee_cents],
        };

        $commission = round($subtotal * ($percent / 100), 2);
        $platformFee = round($commission + $fixed, 2);

        return [
            'subtotal' => round($subtotal, 2),
            'platform_fee' => $platformFee,
            'total' => round($subtotal + $platformFee, 2),
        ];
    }
}
