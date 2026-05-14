<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray($request)
    {
        $media = $this->media ?? collect();

        $previews = $media
            ->where('collection_name', 'previews')
            ->sortBy('order_column');

        $asset = $media
            ->firstWhere('collection_name', 'asset');

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'price' => $this->price,
            'category_id' => $this->category_id,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'asset_type' => $this->asset_type ?? 'Premium',
            'is_published' => (bool) $this->is_published,

            'category' => $this->category?->only(['id', 'name']),

            'preview_urls' => $previews
                ->map(fn ($m) => $m->getFullUrl())
                ->values()
                ->toArray(),

            'previews' => $previews
                ->map(fn ($m) => [
                    'id' => $m->id,
                    'url' => $m->getFullUrl(),
                    'name' => $m->file_name,
                    'size' => $m->size,
                ])
                ->values()
                ->toArray(),

            'asset' => $asset ? [
                'url' => $asset->getFullUrl(),
                'file_name' => $asset->file_name,
                'size' => $asset->size,
                'mime_type' => $asset->mime_type,
            ] : null,

            // set by controller (no query in resource)
            'is_wishlisted' => $this->is_wishlisted ?? false,
        ];
    }
}
