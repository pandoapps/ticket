<?php

namespace App\Http\Requests\Producer;

use App\Enums\AbacateEnvironment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpsertCredentialsRequest extends FormRequest
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
        return [
            'secret_key' => ['nullable', 'string', 'max:255'],
            'webhook_secret' => ['nullable', 'string', 'max:255'],
            'environment' => [
                'required',
                Rule::in([AbacateEnvironment::Sandbox->value, AbacateEnvironment::Production->value]),
            ],
        ];
    }
}
