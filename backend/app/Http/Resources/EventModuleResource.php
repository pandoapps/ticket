<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventModuleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'event_id' => $this->event_id,
            'title' => $this->title,
            'description' => $this->description,
            'sort_order' => (int) $this->sort_order,
            'lessons' => EventLessonResource::collection($this->whenLoaded('lessons')),
        ];
    }
}
