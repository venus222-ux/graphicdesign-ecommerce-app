<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray($request)
    {
        // --- Relațiile ---
        if (!$this->relationLoaded('category')) {
            $this->load('category');
        }

        // --- Construim lista de preview-uri ---
        $previewUrls = [];

        // 1️⃣ Din coloana preview_images (JSON array)
        if (!empty($this->preview_images)) {
            $images = json_decode($this->preview_images, true);
            if (is_array($images)) {
                foreach ($images as $img) {
                    if ($img) {
                        $previewUrls[] = asset('storage/media/' . $img);
                    }
                }
            }
        }

        // 2️⃣ Fallback la preview_image (single image)
        if (empty($previewUrls) && !empty($this->preview_image)) {
            $previewUrls[] = asset('storage/media/' . $this->preview_image);
        }

        $previewUrl = $previewUrls[0] ?? null;

        // --- Category ---
        $category = null;
        if (!empty($this->category)) {
            $category = is_object($this->category) && method_exists($this->category, 'only')
                ? $this->category->only(['id', 'name'])
                : (array) $this->category;
        }

        return [
            'id'                => $this->id,
            'slug'              => $this->slug ?? null,
            'title'             => $this->title,
            'price'             => $this->price,
            'short_description' => $this->short_description,
            'description'       => $this->description,
            'asset_type'        => $this->asset_type ?? 'Premium',
            'category'          => $category,
            'preview_url'       => $previewUrl,
            'preview_urls'      => $previewUrls ?: ($previewUrl ? [$previewUrl] : []),
            'score'             => null,
        ];
    }
}
