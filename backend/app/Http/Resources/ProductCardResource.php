<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductCardResource extends JsonResource
{
public function toArray($request)
{
    return [
        'id' => $this->id,
        'slug' => $this->slug,
        'title' => $this->title,
        'price' => $this->price,
        'category' => $this->category?->only(['id', 'name']),

        'preview_urls' => $this->whenLoaded('media',
            fn() => $this->getMedia('previews')
                ->map(fn($media) => $media->getFullUrl())
                ->values()
                ->toArray(),
            []
        ),
        'preview_url' => $this->getFirstMediaUrl('previews') ?: null,
    ];
}
}
