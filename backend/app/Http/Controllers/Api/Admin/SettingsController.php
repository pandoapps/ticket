<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function show(): JsonResponse
    {
        return response()->json(['data' => PlatformSetting::current()]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'pix_commission_percent' => ['required', 'numeric', 'min:0', 'max:100'],
            'pix_fixed_fee_cents' => ['required', 'numeric', 'min:0'],
            'card_commission_percent' => ['required', 'numeric', 'min:0', 'max:100'],
            'card_fixed_fee_cents' => ['required', 'numeric', 'min:0'],
        ]);

        $settings = PlatformSetting::current();
        $settings->update($data);

        $this->audit->log('settings.updated', $settings, $data);

        return response()->json(['data' => $settings->fresh()]);
    }
}
