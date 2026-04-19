<?php

namespace App\Models;

use App\Enums\AbacateEnvironment;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProducerCredential extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'producer_id',
        'secret_key',
        'webhook_secret',
        'environment',
        'validated_at',
        'validation_error',
    ];

    protected $hidden = [
        'secret_key',
        'webhook_secret',
    ];

    protected function casts(): array
    {
        return [
            'secret_key' => 'encrypted',
            'webhook_secret' => 'encrypted',
            'environment' => AbacateEnvironment::class,
            'validated_at' => 'datetime',
        ];
    }

    public function producer(): BelongsTo
    {
        return $this->belongsTo(Producer::class);
    }
}
