<?php

namespace App\Services;

use App\Enums\PaymentMethod;
use App\Models\PlatformSetting;

class PricingService
{
    /**
     * @return array{subtotal: float, discount_amount: float, platform_fee: float, total: float}
     */
    public function breakdown(float $subtotal, PaymentMethod $method, ?float $discountPercent = null): array
    {
        $settings = PlatformSetting::current();

        [$percent, $fixed] = match ($method) {
            PaymentMethod::Pix => [(float) $settings->pix_commission_percent, (float) $settings->pix_fixed_fee_cents],
            PaymentMethod::Card => [(float) $settings->card_commission_percent, (float) $settings->card_fixed_fee_cents],
        };

        $discountAmount = 0.0;
        if ($discountPercent !== null && $discountPercent > 0) {
            $discountAmount = round($subtotal * ($discountPercent / 100), 2);
        }

        $discountedSubtotal = max(0.0, round($subtotal - $discountAmount, 2));
        $commission = round($discountedSubtotal * ($percent / 100), 2);
        $platformFee = round($commission + $fixed, 2);

        return [
            'subtotal' => round($subtotal, 2),
            'discount_amount' => $discountAmount,
            'platform_fee' => $platformFee,
            'total' => round($discountedSubtotal + $platformFee, 2),
        ];
    }
}
