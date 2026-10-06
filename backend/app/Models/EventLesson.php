<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class EventLesson extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'event_module_id',
        'title',
        'description',
        'video_url',
        'duration_minutes',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'duration_minutes' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(EventModule::class, 'event_module_id');
    }

    public function materials(): HasMany
    {
        return $this->hasMany(LessonMaterial::class)->orderBy('sort_order')->orderBy('id');
    }
}
