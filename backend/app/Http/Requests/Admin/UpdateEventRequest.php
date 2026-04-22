<?php

namespace App\Http\Requests\Admin;

use App\Enums\EventStatus;
use App\Enums\VenueType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEventRequest extends FormRequest
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
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'status' => ['required', Rule::in(array_column(EventStatus::cases(), 'value'))],
            'venue_type' => ['required', Rule::in([VenueType::Physical->value, VenueType::Online->value])],
            'venue_name' => ['nullable', 'string', 'max:255'],
            'venue_address' => ['nullable', 'string', 'max:500'],
            'online_url' => ['nullable', 'url', 'max:500'],
            'banner_url' => ['nullable', 'url', 'max:500'],
            'header_url' => ['nullable', 'url', 'max:500'],
            'is_featured' => ['boolean'],
            'accepts_pix' => ['boolean'],
            'accepts_card' => ['boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (! $this->has('accepts_pix') && ! $this->has('accepts_card')) {
                return;
            }
            $event = $this->route('event');
            $pix = $this->has('accepts_pix') ? $this->boolean('accepts_pix') : (bool) ($event?->accepts_pix ?? true);
            $card = $this->has('accepts_card') ? $this->boolean('accepts_card') : (bool) ($event?->accepts_card ?? true);
            if (! $pix && ! $card) {
                $validator->errors()->add('accepts_pix', 'Selecione ao menos um método de pagamento.');
            }
        });
    }
}
