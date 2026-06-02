<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductSearchResource extends JsonResource
{
public function toArray($request)
{
    // Use $this->resource to access the object directly
    $r = $this->resource;

    return [
        'id'                => $r->id ?? null,
        'slug'              => $r->slug ?? null,
        'title'             => $r->title ?? null,
        'price'             => (float) ($r->price ?? 0),
        'final_price'       => (float) ($r->final_price ?? $r->price ?? 0),
        'asset_type'        => $r->asset_type ?? 'Premium',
        'preview_url'       => $r->preview_urls[0] ?? $r->preview_url ?? null,
        'preview_urls'      => $r->preview_urls ?? [],

        // Safely check if category_name exists on the object
        'category'          => isset($r->category_name) ? ['name' => $r->category_name] : null,

        'score'             => $r->score ?? null,
        // ... rest of your fields
    ];
}
}
