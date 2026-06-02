<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use Illuminate\Http\JsonResponse;

class PlatformConfigController extends Controller
{
    public function show(): JsonResponse
    {
        $settings = PlatformSetting::current();

        return response()->json([
            'data' => [
                'active_gateway' => $settings->active_gateway ?? 'abacate_pay',
            ],
        ]);
    }
}
