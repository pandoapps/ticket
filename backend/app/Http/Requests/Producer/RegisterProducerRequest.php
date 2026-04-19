<?php

namespace App\Http\Requests\Producer;

use Illuminate\Foundation\Http\FormRequest;

class RegisterProducerRequest extends FormRequest
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
            'company_name' => ['required', 'string', 'max:255'],
            'document' => ['required', 'string', 'max:20', 'unique:producers,document'],
            'phone' => ['nullable', 'string', 'max:20'],
        ];
    }
}
