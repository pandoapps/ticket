<?php

namespace App\Models;

use App\Enums\ProducerStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Producer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'company_name',
        'document',
        'phone',
        'status',
        'approved_at',
        'blocked_at',
        'blocked_reason',
    ];

    protected function casts(): array
    {
        return [
            'status' => ProducerStatus::class,
            'approved_at' => 'datetime',
            'blocked_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function credentials(): HasOne
    {
        return $this->hasOne(ProducerCredential::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function isApproved(): bool
    {
        return $this->status === ProducerStatus::Approved;
    }

    public function hasValidCredentials(): bool
    {
        return $this->credentials !== null && $this->credentials->validated_at !== null;
    }
}
