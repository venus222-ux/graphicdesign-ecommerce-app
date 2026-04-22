<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
public function toArray($request)
{
    $this->loadMissing(['media', 'category']);

    $previewUrls = $this->getMedia('previews')
        ->sortBy('order_column')                    // keep upload order
        ->map(fn($media) => $media->getFullUrl())
        ->values()
        ->toArray();

    return [
        'id'                => $this->id,
        'slug'              => $this->slug,
        'title'             => $this->title,
        'price'             => $this->price,
        'short_description' => $this->short_description,
        'description'       => $this->description,
        'asset_type'        => $this->asset_type ?? 'Premium',
        'category'          => $this->category?->only(['id', 'name']),
        'preview_url'       => $this->getFirstMediaUrl('previews') ?: null,
        'preview_urls'      => $previewUrls,
        'related_products'  => ProductCardResource::collection(
            $this->whenLoaded('relatedProducts')
        ),
    ];
}
}
/***
 * whenLoaded() ensures no extra queries are run inside the resource
 * — only returns data for relationships you explicitly loaded.
 */
