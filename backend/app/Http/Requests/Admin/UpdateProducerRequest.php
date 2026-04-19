<?php

namespace App\Http\Requests\Admin;

use App\Enums\ProducerStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProducerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $producerId = $this->route('producer')?->id;

        return [
            'company_name' => ['required', 'string', 'max:255'],
            'document' => [
                'required',
                'string',
                'max:32',
                Rule::unique('producers', 'document')->ignore($producerId),
            ],
            'phone' => ['nullable', 'string', 'regex:/^\D*(\d\D*){10,11}$/'],
            'status' => ['required', Rule::in(array_column(ProducerStatus::cases(), 'value'))],
            'blocked_reason' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'phone.regex' => 'Telefone inválido. Use DDD + número (10 ou 11 dígitos).',
        ];
    }
}
