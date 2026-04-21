<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray($request)
    {
        // Force load media + category (safety + performance)
        if (!$this->relationLoaded('media')) {
         $this->load('media');
       }
        if (!$this->relationLoaded('category')) {
            $this->load('category');
        }

        // Get URLs directly from accessor
        $previewUrls = $this->getMedia('previews')
          ->map(fn($media) => $media->getFullUrl())
          ->toArray();

        // Strong fallback
        if (empty($previewUrls) && $this->preview_url) {
            $previewUrls = [$this->preview_url];
        }

        $previewUrl = $previewUrls[0] ?? null;

        return [
            'id'                => $this->id,
            'slug'              => $this->slug,
            'title'             => $this->title,
            'price'             => $this->price,
            'short_description' => $this->short_description,
            'description'       => $this->description,
            'asset_type'        => $this->asset_type ?? 'Premium',
            'category'          => $this->category?->only(['id', 'name']),
            'preview_url'       => $previewUrl,
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
