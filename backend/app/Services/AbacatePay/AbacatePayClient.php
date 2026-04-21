<?php

namespace App\Services\AbacatePay;

use App\Enums\AbacateEnvironment;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class AbacatePayClient
{
    public function __construct(
        private readonly string $secretKey,
        private readonly string $baseUrl,
    ) {}

    public static function forEnvironment(string $secretKey, AbacateEnvironment $environment): self
    {
        return new self($secretKey, self::urlFor($environment));
    }

    public static function urlFor(AbacateEnvironment $environment): string
    {
        return match ($environment) {
            AbacateEnvironment::Production => (string) config('services.abacate_pay.production_url'),
            AbacateEnvironment::Sandbox => (string) config('services.abacate_pay.sandbox_url'),
        };
    }

    public function ping(): Response
    {
        return $this->request()->get('/customers/list');
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function createTransparent(array $payload): array
    {
        return $this->request()->post('/transparents/create', $payload)->throw()->json() ?? [];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function createCheckout(array $payload): array
    {
        return $this->request()->post('/checkouts/create', $payload)->throw()->json() ?? [];
    }

    /**
     * @return array<string, mixed>
     */
    public function checkTransparent(string $id): array
    {
        return $this->request()->get("/transparents/check?id={$id}")->throw()->json() ?? [];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function createProduct(array $payload): array
    {
        return $this->request()->post('/products/create', $payload)->throw()->json() ?? [];
    }

    /**
     * @return array<string, mixed>
     */
    public function deleteProduct(string $id): array
    {
        return $this->request()->post("/products/delete?id={$id}")->throw()->json() ?? [];
    }

    private function request(): PendingRequest
    {
        return Http::withToken($this->secretKey)
            ->acceptJson()
            ->asJson()
            ->baseUrl($this->baseUrl);
    }
}
