<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventLessonResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'event_module_id' => $this->event_module_id,
            'title' => $this->title,
            'description' => $this->description,
            'video_url' => $this->video_url,
            'duration_minutes' => $this->duration_minutes !== null ? (int) $this->duration_minutes : null,
            'sort_order' => (int) $this->sort_order,
            'materials' => LessonMaterialResource::collection($this->whenLoaded('materials')),
        ];
    }
}
