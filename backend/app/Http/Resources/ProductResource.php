<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray($request)
    {
        // Force fresh load of media
        $this->load('media');

        $previews = $this->getMedia('previews')
                         ->sortBy('order_column');

        return [
            'id'                => $this->id,
            'slug'              => $this->slug,
            'title'             => $this->title,
            'price'             => $this->price,
            'short_description' => $this->short_description,
            'description'       => $this->description,
            'asset_type'        => $this->asset_type ?? 'Premium',
            'category'          => $this->category?->only(['id', 'name']),

            'preview_url'  => $previews->first()?->getFullUrl() ?? null,
            'preview_urls' => $previews->map(fn($media) => $media->getFullUrl())->values()->toArray(),

            'previews' => $previews->map(fn($media) => [
                'id'    => $media->id,
                'url'   => $media->getFullUrl(),
                'name'  => $media->file_name,
            ]),
        ];
    }
}
