<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TicketLot extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'event_id',
        'name',
        'price',
        'quantity',
        'sold',
        'sales_start_at',
        'sales_end_at',
        'is_half_price',
        'abacate_product_id',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'sales_start_at' => 'datetime',
            'sales_end_at' => 'datetime',
            'is_half_price' => 'boolean',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function available(): int
    {
        return max(0, (int) $this->quantity - (int) $this->sold);
    }

    public function isOnSale(): bool
    {
        $now = now();
        if ($this->sales_start_at !== null && $now->lt($this->sales_start_at)) {
            return false;
        }
        if ($this->sales_end_at !== null && $now->gt($this->sales_end_at)) {
            return false;
        }
        return $this->available() > 0;
    }
}
