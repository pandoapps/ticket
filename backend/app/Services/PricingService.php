<?php

namespace App\Services;

use App\Models\PlatformSetting;

class PricingService
{
    /**
     * @return array{subtotal: float, platform_fee: float, total: float}
     */
    public function breakdown(float $subtotal): array
    {
        $settings = PlatformSetting::current();
        $commission = round($subtotal * ((float) $settings->commission_percent / 100), 2);
        $fixedFee = (float) $settings->fixed_fee_cents;
        $platformFee = round($commission + $fixedFee, 2);

        return [
            'subtotal' => round($subtotal, 2),
            'platform_fee' => $platformFee,
            'total' => round($subtotal + $platformFee, 2),
        ];
    }
}
