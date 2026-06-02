<?php

namespace App\Http\Requests\Producer;

use Illuminate\Foundation\Http\FormRequest;

class CreatePosOrderRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'event_id' => ['required', 'integer', 'exists:events,id'],
            'customer_id' => ['nullable', 'integer', 'exists:users,id'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'payment_mode' => ['required', 'in:link,manual'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.ticket_lot_id' => ['required', 'integer', 'exists:ticket_lots,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
        ];
    }
}
