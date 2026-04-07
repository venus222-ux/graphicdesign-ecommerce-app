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
            'preview_url' => $this->preview_url,
            'preview_urls' => $this->preview_urls,
            'category' => $this->category?->only(['id', 'name']),
        ];
    }
}
