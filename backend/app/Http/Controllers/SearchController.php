<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductSearchResource;
use Illuminate\Http\Request;
use App\Services\ProductSearchService;

class SearchController extends Controller
{
    public function search(Request $request, ProductSearchService $searchService)
    {
        $query = $request->input('q', '');
        $page  = (int) $request->input('page', 1);
        $size  = (int) $request->input('per_page', 12);
        $from  = ($page - 1) * $size;

        $filters = [
            'category'   => $request->input('category'),
            'asset_type' => $request->input('asset_type'),
            'min_price'  => $request->input('min_price'),
            'max_price'  => $request->input('max_price'),
        ];

        // Perform Elasticsearch search
        $results = $searchService->search($query, $filters, $from, $size);

        $hits  = $results['hits']['hits'] ?? [];
        $total = $results['hits']['total']['value'] ?? 0;

        // Safely map Elasticsearch hits
   $products = collect($hits)->map(function ($item) {
    $source = $item['_source'] ?? [];

    $previewUrl  = $source['preview_url'] ?? null;
    $previewUrls = $source['preview_urls'] ?? null;

    if (empty($previewUrls) && $previewUrl) {
        $previewUrls = [$previewUrl];
    }

    return (object) [
        'id'                => $source['id'] ?? null,
        'slug'              => $source['slug'] ?? null,
        'title'             => $source['title'] ?? null,
        'price'             => $source['price'] ?? null,
        'short_description' => $source['short_description'] ?? null,
        'description'       => $source['description'] ?? null,
        'asset_type'        => $source['asset_type'] ?? 'Premium',
        'preview_url'       => $previewUrl,
        'preview_urls'      => $previewUrls ?? [],
        'category'          => isset($source['category_name'])
            ? ['name' => $source['category_name']]
            : null,
        'score'             => $item['_score'] ?? null,
    ];
});
        return response()->json([
            'data'         => ProductSearchResource::collection($products)->resolve(),
            'total'        => $total,
            'current_page' => $page,
            'per_page'     => $size,
            'last_page'    => ceil($total / $size),
        ]);
    }
}
