<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use App\Support\Cpf;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
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
        $userId = $this->route('user')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'phone' => ['nullable', 'string', 'regex:/^\D*(\d\D*){10,11}$/'],
            'cpf' => [
                'nullable',
                'string',
                function (string $attribute, mixed $value, Closure $fail): void {
                    if ($value !== null && $value !== '' && ! Cpf::isValid((string) $value)) {
                        $fail('CPF inválido. Confira o número digitado.');
                    }
                },
            ],
            'role' => ['required', Rule::in(array_column(UserRole::cases(), 'value'))],
            'password' => ['nullable', 'string', 'min:8', 'max:255'],
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
