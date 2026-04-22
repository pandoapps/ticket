<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function validate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'event_id' => ['required', 'integer', 'exists:events,id'],
            'code' => ['required', 'string', 'max:50'],
        ]);

        $code = strtoupper(trim((string) $data['code']));

        $coupon = Coupon::where('event_id', $data['event_id'])
            ->where('code', $code)
            ->first();

        if ($coupon === null) {
            return response()->json(['message' => 'Cupom inválido para este evento.'], 422);
        }

        if (($reason = $coupon->unavailableReason()) !== null) {
            return response()->json(['message' => $reason], 422);
        }

        return response()->json([
            'data' => [
                'code' => $coupon->code,
                'discount_percent' => (float) $coupon->discount_percent,
            ],
        ]);
    }
}
