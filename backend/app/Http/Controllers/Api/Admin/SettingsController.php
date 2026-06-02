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

    public function updateGateway(Request $request): JsonResponse
    {
        $data = $request->validate([
            'active_gateway' => ['required', 'in:abacate_pay,stripe'],
            'abacatepay_public_key' => ['nullable', 'string', 'max:255'],
            'abacatepay_secret_key' => ['nullable', 'string', 'max:500'],
            'stripe_public_key' => ['nullable', 'string', 'max:255'],
            'stripe_secret_key' => ['nullable', 'string', 'max:500'],
        ]);

        $settings = PlatformSetting::current();

        $updateData = [
            'active_gateway' => $data['active_gateway'],
            'abacatepay_public_key' => $data['abacatepay_public_key'] ?? $settings->abacatepay_public_key,
            'stripe_public_key' => $data['stripe_public_key'] ?? $settings->stripe_public_key,
        ];

        if (! empty($data['abacatepay_secret_key'])) {
            $updateData['abacatepay_secret_key'] = $data['abacatepay_secret_key'];
        }

        if (! empty($data['stripe_secret_key'])) {
            $updateData['stripe_secret_key'] = $data['stripe_secret_key'];
        }

        $settings->update($updateData);

        $this->audit->log('settings.gateway_updated', $settings, ['active_gateway' => $data['active_gateway']]);

        return response()->json(['data' => $settings->fresh()]);
    }

    public function updateEmail(Request $request): JsonResponse
    {
        $data = $request->validate([
            'mailgun_domain' => ['nullable', 'string', 'max:255'],
            'mailgun_secret' => ['nullable', 'string', 'max:500'],
            'mailgun_endpoint' => ['nullable', 'string', 'in:api.mailgun.net,api.eu.mailgun.net'],
            'mail_from_address' => ['nullable', 'email', 'max:255'],
            'mail_from_name' => ['nullable', 'string', 'max:255'],
        ]);

        $settings = PlatformSetting::current();

        $updateData = [
            'mailgun_domain' => $data['mailgun_domain'] ?? $settings->mailgun_domain,
            'mailgun_endpoint' => $data['mailgun_endpoint'] ?? $settings->mailgun_endpoint,
            'mail_from_address' => $data['mail_from_address'] ?? $settings->mail_from_address,
            'mail_from_name' => $data['mail_from_name'] ?? $settings->mail_from_name,
        ];

        if (! empty($data['mailgun_secret'])) {
            $updateData['mailgun_secret'] = $data['mailgun_secret'];
        }

        $settings->update($updateData);

        // Invalidate cached instance so next read reflects new values.
        PlatformSetting::$cached = null;

        $this->audit->log('settings.email_updated', $settings);

        return response()->json(['data' => $settings->fresh()]);
    }
}
