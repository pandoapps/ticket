<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Coupon extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'event_id',
        'producer_id',
        'code',
        'discount_percent',
        'max_uses',
        'used_count',
        'starts_at',
        'ends_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'discount_percent' => 'decimal:2',
            'max_uses' => 'integer',
            'used_count' => 'integer',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function producer(): BelongsTo
    {
        return $this->belongsTo(Producer::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeForEvent(Builder $query, int $eventId): Builder
    {
        return $query->where('event_id', $eventId);
    }

    public function isUsable(?DateTimeInterface $now = null): bool
    {
        $now ??= now();

        if (! $this->is_active) {
            return false;
        }
        if ($this->starts_at !== null && $now < $this->starts_at) {
            return false;
        }
        if ($this->ends_at !== null && $now > $this->ends_at) {
            return false;
        }
        if ($this->max_uses !== null && $this->used_count >= $this->max_uses) {
            return false;
        }

        return true;
    }

    public function unavailableReason(?DateTimeInterface $now = null): ?string
    {
        $now ??= now();

        if (! $this->is_active) {
            return 'Cupom desativado.';
        }
        if ($this->starts_at !== null && $now < $this->starts_at) {
            return 'Cupom ainda não está disponível.';
        }
        if ($this->ends_at !== null && $now > $this->ends_at) {
            return 'Cupom expirado.';
        }
        if ($this->max_uses !== null && $this->used_count >= $this->max_uses) {
            return 'Cupom esgotado.';
        }

        return null;
    }
}
