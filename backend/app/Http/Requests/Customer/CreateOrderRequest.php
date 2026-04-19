<?php

namespace App\Http\Requests\Customer;

use App\Support\Cpf;
use Closure;
use Illuminate\Foundation\Http\FormRequest;

class CreateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $user = $this->user();
        $phoneRule = $user?->phone ? ['nullable'] : ['required'];
        $cpfRule = $user?->cpf ? ['nullable'] : ['required'];

        return [
            'event_id' => ['required', 'integer', 'exists:events,id'],
            'payment_method' => ['required', 'string', 'in:pix,card'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.ticket_lot_id' => ['required', 'integer', 'exists:ticket_lots,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:20'],
            'phone' => array_merge($phoneRule, ['string', 'regex:/^\D*(\d\D*){10,11}$/']),
            'cpf' => array_merge($cpfRule, ['string', $this->cpfChecksumRule()]),
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'phone.required' => 'Informe seu telefone (DDD + número).',
            'phone.regex' => 'Telefone inválido. Use DDD + número (10 ou 11 dígitos).',
            'cpf.required' => 'Informe seu CPF.',
            'payment_method.required' => 'Escolha a forma de pagamento.',
            'payment_method.in' => 'Forma de pagamento inválida.',
        ];
    }

    private function cpfChecksumRule(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            if (! Cpf::isValid((string) $value)) {
                $fail('CPF inválido. Confira o número digitado.');
            }
        };
    }
}
