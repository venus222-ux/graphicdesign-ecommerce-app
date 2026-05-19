<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductSearchResource extends JsonResource
{
    public function toArray($request)
    {
        $resource = $this->resource;

        // --- Previews ---
        $previewUrls = [];

        // Dacă avem multiple imagini în MediaLibrary (sau JSON)
        if (!empty($resource->preview_urls) && is_array($resource->preview_urls)) {
            $previewUrls = $resource->preview_urls;
        } elseif (!empty($resource->preview_url)) {
            // fallback la single preview
            $previewUrls[] = $resource->preview_url;
        }

        $previewUrl = $previewUrls[0] ?? null;

        // --- Category ---
        // Dacă category este obiect, apelăm only(), altfel convertim la array
        $category = null;
        if (!empty($resource->category)) {
            $category = is_object($resource->category) && method_exists($resource->category, 'only')
                ? $resource->category->only(['id', 'name'])
                : (array) $resource->category;
        }

        return [
            'id'                 => $resource->id ?? null,
            'slug'               => $resource->slug ?? null,
            'title'              => $resource->title ?? null,
            'price'              => $resource->price ?? null,
            'final_price'        => $this->final_price ?? $this->price ?? null,
            'old_price'          => $this->old_price ?? null,
            'discount_percentage'=> $this->discount_percentage ?? null,
            'short_description'  => $resource->short_description ?? null,
            'description'        => $resource->description ?? null,
            'asset_type'         => $resource->asset_type ?? 'Premium',
            'score'              => $resource->score ?? null,
            'preview_url'        => $previewUrl,
            'preview_urls'       => $previewUrls,
            'category'           => $category,
        ];
    }
}
