<?php

namespace App\Http\Controllers\Api\Producer;

use App\Enums\AbacateEnvironment;
use App\Http\Controllers\Controller;
use App\Http\Requests\Producer\UpsertCredentialsRequest;
use App\Models\Producer;
use App\Services\AbacatePay\AbacatePayService;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CredentialController extends Controller
{
    public function __construct(
        private readonly AbacatePayService $abacate,
        private readonly AuditLogger $audit,
    ) {}

    public function show(Request $request): JsonResponse
    {
        $producer = $this->resolveProducer($request);
        $credentials = $producer->credentials;

        return response()->json([
            'data' => [
                'has_secret' => $credentials !== null,
                'has_webhook_secret' => $credentials !== null && ! empty($credentials->webhook_secret),
                'environment' => $credentials?->environment?->value ?? AbacateEnvironment::Sandbox->value,
                'validated_at' => $credentials?->validated_at?->toIso8601String(),
                'validation_error' => $credentials?->validation_error,
            ],
        ]);
    }

    public function update(UpsertCredentialsRequest $request): JsonResponse
    {
        $producer = $this->resolveProducer($request);
        $data = $request->validated();
        $existing = $producer->credentials;

        $newSecretKey = isset($data['secret_key']) && $data['secret_key'] !== '' ? $data['secret_key'] : null;
        $newWebhookSecret = isset($data['webhook_secret']) && $data['webhook_secret'] !== '' ? $data['webhook_secret'] : null;

        $effectiveSecretKey = $newSecretKey ?? $existing?->secret_key;
        if ($effectiveSecretKey === null) {
            return response()->json([
                'message' => 'Informe a API Key do Abacate Pay.',
                'errors' => ['secret_key' => ['A API Key é obrigatória no primeiro cadastro.']],
            ], 422);
        }

        $environment = AbacateEnvironment::from($data['environment']);

        $attributes = [
            'secret_key' => $effectiveSecretKey,
            'environment' => $data['environment'],
        ];

        $shouldValidate = $newSecretKey !== null
            || $existing === null
            || $existing->environment?->value !== $data['environment'];

        if ($shouldValidate) {
            $result = $this->abacate->validateCredentials($effectiveSecretKey, $environment);
            $attributes['validated_at'] = $result['valid'] ? now() : null;
            $attributes['validation_error'] = $result['valid'] ? null : $result['error'];
        } else {
            $result = ['valid' => $existing->validated_at !== null, 'status' => 'unchanged', 'error' => $existing->validation_error];
        }

        if ($newWebhookSecret !== null) {
            $attributes['webhook_secret'] = $newWebhookSecret;
        }

        $credentials = $producer->credentials()->updateOrCreate([], $attributes);

        $this->audit->log('producer.credentials_updated', $producer, [
            'valid' => $result['valid'],
            'status' => $result['status'],
            'environment' => $data['environment'],
            'secret_key_changed' => $newSecretKey !== null,
            'webhook_secret_changed' => $newWebhookSecret !== null,
            'webhook_secret_set' => ! empty($credentials->webhook_secret),
        ]);

        return response()->json([
            'data' => [
                'has_secret' => true,
                'has_webhook_secret' => ! empty($credentials->webhook_secret),
                'environment' => $credentials->environment?->value,
                'validated_at' => $credentials->validated_at?->toIso8601String(),
                'validation_error' => $credentials->validation_error,
            ],
        ]);
    }

    private function resolveProducer(Request $request): Producer
    {
        $producer = $request->user()->producer()->with('credentials')->first();
        abort_if($producer === null, 404, 'Cadastro de produtor não encontrado.');

        return $producer;
    }
}
