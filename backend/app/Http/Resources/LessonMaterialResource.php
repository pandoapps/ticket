<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LessonMaterialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'event_lesson_id' => $this->event_lesson_id,
            'title' => $this->title,
            'url' => $this->url,
            'sort_order' => (int) $this->sort_order,
        ];
    }
}
