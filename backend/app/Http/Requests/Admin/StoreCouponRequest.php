<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('code')) {
            $this->merge(['code' => strtoupper(trim((string) $this->input('code')))]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $couponId = $this->route('coupon')?->id;

        return [
            'event_id' => ['required', 'integer', 'exists:events,id'],
            'code' => [
                'required',
                'string',
                'max:50',
                'regex:/^[A-Z0-9_-]+$/',
                Rule::unique('coupons', 'code')
                    ->where(fn ($q) => $q->where('event_id', $this->input('event_id'))->whereNull('deleted_at'))
                    ->ignore($couponId),
            ],
            'discount_percent' => ['required', 'numeric', 'min:0.01', 'max:100'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'code.regex' => 'O código deve conter apenas letras, números, hífen e sublinhado.',
            'code.unique' => 'Já existe um cupom com este código para este evento.',
            'discount_percent.min' => 'O desconto deve ser maior que zero.',
            'discount_percent.max' => 'O desconto não pode ultrapassar 100%.',
            'ends_at.after' => 'A data de término deve ser posterior à data de início.',
        ];
    }
}
