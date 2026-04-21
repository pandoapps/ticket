<?php

namespace App\Services\AbacatePay;

use App\Enums\AbacateEnvironment;
use App\Models\Order;
use App\Models\Producer;
use App\Models\TicketLot;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AbacatePayService
{
    public function clientFor(Producer $producer): AbacatePayClient
    {
        $credentials = $producer->credentials;
        if ($credentials === null) {
            throw new \RuntimeException('Produtor sem credenciais configuradas.');
        }

        $environment = $credentials->environment ?? AbacateEnvironment::Sandbox;

        return AbacatePayClient::forEnvironment($credentials->secret_key, $environment);
    }

    /**
     * @return array{valid: bool, status: int|null, error: string|null}
     */
    public function validateCredentials(string $secretKey, AbacateEnvironment $environment): array
    {
        try {
            $client = AbacatePayClient::forEnvironment($secretKey, $environment);
            $response = $client->ping();
            $status = $response->status();

            if ($response->successful()) {
                return ['valid' => true, 'status' => $status, 'error' => null];
            }

            $body = $response->json();
            $message = is_array($body) ? ($body['error'] ?? $body['message'] ?? null) : null;

            Log::warning('AbacatePay credential validation failed', [
                'status' => $status,
                'environment' => $environment->value,
                'body' => $body,
            ]);

            return [
                'valid' => false,
                'status' => $status,
                'error' => $this->humanize($status, $message),
            ];
        } catch (\Throwable $e) {
            Log::warning('AbacatePay credential validation error', [
                'message' => $e->getMessage(),
                'environment' => $environment->value,
            ]);

            return ['valid' => false, 'status' => null, 'error' => 'Falha de rede ao contatar o Abacate Pay.'];
        }
    }

    /**
     * @return array{charge_id: string, pix_code: ?string, pix_qr_code: ?string, raw: array<string, mixed>}
     */
    public function createPixChargeForOrder(Order $order): array
    {
        $producer = $order->producer()->with('credentials')->firstOrFail();
        $client = $this->clientFor($producer);

        $customer = $order->customer;
        $phone = preg_replace('/\D+/', '', (string) $customer->phone);
        $taxId = preg_replace('/\D+/', '', (string) $customer->cpf);

        if ($phone === '' || $taxId === '') {
            throw new \RuntimeException('Cliente sem telefone ou CPF cadastrado.');
        }

        $payload = [
            'method' => 'PIX',
            'data' => [
                'amount' => (int) round(((float) $order->total) * 100),
                'expiresIn' => 3600,
                'description' => 'Ingressos: '.($order->event->name ?? 'Evento'),
                'customer' => [
                    'name' => $customer->name,
                    'email' => $customer->email,
                    'cellphone' => '+55'.$phone,
                    'taxId' => $taxId,
                ],
                'externalId' => (string) $order->id,
            ],
        ];

        try {
            $response = $client->createTransparent($payload);
        } catch (RequestException $e) {
            $body = $e->response->json();
            $remoteMessage = is_array($body) ? ($body['error'] ?? $body['message'] ?? null) : null;
            Log::warning('AbacatePay charge creation failed', [
                'status' => $e->response->status(),
                'body' => $body,
                'order_id' => $order->id,
            ]);
            throw new HttpException(
                422,
                'Não foi possível gerar o PIX no momento. '.($remoteMessage ?? 'Tente novamente em instantes.'),
                $e,
            );
        }

        $data = $response['data'] ?? $response;

        $chargeId = (string) ($data['id'] ?? '');
        if ($chargeId === '') {
            Log::warning('AbacatePay returned unexpected payload', [
                'order_id' => $order->id,
                'response' => $response,
            ]);
            throw new HttpException(422, 'Resposta inválida do gateway de pagamento.');
        }

        return [
            'charge_id' => $chargeId,
            'pix_code' => $data['brCode'] ?? null,
            'pix_qr_code' => $data['brCodeBase64'] ?? null,
            'raw' => $response,
        ];
    }

    /**
     * @return array{charge_id: string, checkout_url: ?string, raw: array<string, mixed>}
     */
    public function createCardChargeForOrder(Order $order): array
    {
        $producer = $order->producer()->with('credentials')->firstOrFail();
        $client = $this->clientFor($producer);

        $productPayload = [
            'externalId' => 'order_'.$order->id.'_'.now()->timestamp,
            'name' => 'Pedido #'.$order->id.' - '.($order->event->name ?? 'Evento'),
            'price' => (int) round(((float) $order->total) * 100),
            'currency' => 'BRL',
        ];

        try {
            $productResponse = $client->createProduct($productPayload);
        } catch (RequestException $e) {
            $body = $e->response->json();
            $remoteMessage = is_array($body) ? ($body['error'] ?? $body['message'] ?? null) : null;
            Log::warning('AbacatePay order-product creation failed', [
                'status' => $e->response->status(),
                'body' => $body,
                'order_id' => $order->id,
            ]);
            throw new HttpException(
                422,
                'Não foi possível preparar o checkout de cartão. '.($remoteMessage ?? 'Tente novamente em instantes.'),
                $e,
            );
        }

        $productData = $productResponse['data'] ?? $productResponse;
        $productId = (string) ($productData['id'] ?? '');

        if ($productId === '') {
            Log::warning('AbacatePay product response missing id for order', [
                'order_id' => $order->id,
                'response' => $productResponse,
            ]);
            throw new HttpException(422, 'Resposta inválida do gateway de pagamento.');
        }

        $frontendUrl = rtrim((string) (env('FRONTEND_URL') ?: config('app.url')), '/');
        $orderUrl = $frontendUrl.'/meus-pedidos/'.$order->id;

        $payload = [
            'items' => [['id' => $productId, 'quantity' => 1]],
            'methods' => ['CARD'],
            'externalId' => (string) $order->id,
            'returnUrl' => $orderUrl,
            'completionUrl' => $orderUrl,
        ];

        try {
            $response = $client->createCheckout($payload);
        } catch (RequestException $e) {
            $body = $e->response->json();
            $remoteMessage = is_array($body) ? ($body['error'] ?? $body['message'] ?? null) : null;
            Log::warning('AbacatePay card checkout creation failed', [
                'status' => $e->response->status(),
                'body' => $body,
                'order_id' => $order->id,
            ]);
            throw new HttpException(
                422,
                'Não foi possível gerar o checkout de cartão. '.($remoteMessage ?? 'Tente novamente em instantes.'),
                $e,
            );
        }

        $data = $response['data'] ?? $response;

        $chargeId = (string) ($data['id'] ?? '');
        if ($chargeId === '') {
            Log::warning('AbacatePay card checkout returned unexpected payload', [
                'order_id' => $order->id,
                'response' => $response,
            ]);
            throw new HttpException(422, 'Resposta inválida do gateway de pagamento.');
        }

        return [
            'charge_id' => $chargeId,
            'checkout_url' => $data['url'] ?? $data['checkoutUrl'] ?? null,
            'raw' => $response,
        ];
    }

    public function syncProductForLot(TicketLot $lot): string
    {
        $event = $lot->event()->with('producer.credentials')->firstOrFail();
        $producer = $event->producer;
        abort_unless($producer->hasValidCredentials(), 422, 'Configure suas credenciais do Abacate Pay antes de sincronizar.');

        $client = $this->clientFor($producer);
        $payload = [
            'externalId' => 'lot_'.$lot->id,
            'name' => $event->name.' - '.$lot->name,
            'price' => (int) round(((float) $lot->price) * 100),
            'currency' => 'BRL',
        ];

        try {
            $response = $client->createProduct($payload);
        } catch (RequestException $e) {
            $body = $e->response->json();
            $remoteMessage = is_array($body) ? ($body['error'] ?? $body['message'] ?? null) : null;
            Log::warning('AbacatePay product creation failed', [
                'status' => $e->response->status(),
                'body' => $body,
                'lot_id' => $lot->id,
            ]);
            throw new HttpException(
                422,
                'Não foi possível sincronizar o produto no Abacate Pay. '.($remoteMessage ?? 'Tente novamente em instantes.'),
                $e,
            );
        }

        $data = $response['data'] ?? $response;
        $productId = (string) ($data['id'] ?? '');
        if ($productId === '') {
            Log::warning('AbacatePay product response missing id', [
                'lot_id' => $lot->id,
                'response' => $response,
            ]);
            throw new HttpException(422, 'Resposta inválida do Abacate Pay ao criar produto.');
        }

        $lot->forceFill(['abacate_product_id' => $productId])->save();

        return $productId;
    }

    public function removeProductForLot(TicketLot $lot): void
    {
        $productId = $lot->abacate_product_id;
        if ($productId === null || $productId === '') {
            return;
        }

        $event = $lot->event()->with('producer.credentials')->firstOrFail();
        $producer = $event->producer;
        if (! $producer->hasValidCredentials()) {
            return;
        }

        $client = $this->clientFor($producer);

        try {
            $client->deleteProduct($productId);
        } catch (RequestException $e) {
            if ($e->response->status() !== 404) {
                Log::warning('AbacatePay product delete failed', [
                    'status' => $e->response->status(),
                    'body' => $e->response->json(),
                    'lot_id' => $lot->id,
                    'product_id' => $productId,
                ]);
                throw $e;
            }
        }

        $lot->forceFill(['abacate_product_id' => null])->save();
    }

    private function humanize(int $status, ?string $message): string
    {
        if ($message === 'API key version mismatch') {
            return 'Sua chave é de uma versão da API incompatível com a URL configurada. Use chaves V2 (prefixo abc_dev_ ou abc_prod_).';
        }
        if ($status === 401 || $status === 403) {
            return 'Chave inválida ou sem permissão. Confira se copiou a chave completa e se o prefixo casa com o ambiente escolhido.';
        }
        if ($status === 404) {
            return 'Endpoint de validação não encontrado. Verifique a URL da API em config/services.php.';
        }
        if ($message) {
            return "Abacate Pay retornou erro (HTTP {$status}): {$message}";
        }

        return "Abacate Pay retornou HTTP {$status}.";
    }
}
