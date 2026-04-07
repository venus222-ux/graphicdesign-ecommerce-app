<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class PublicProductController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 12);

        $products = Product::with(['category'])
            ->where('is_published', true)
            ->latest()
            ->paginate($perPage);

        return ProductResource::collection($products)
            ->additional([
                'total'        => $products->total(),
                'current_page' => $products->currentPage(),
                'per_page'     => $products->perPage(),
                'last_page'    => $products->lastPage(),
            ]);
    }

public function show($slug)
{
    $product = Product::with('category')
        ->where('slug', $slug)
        ->where('is_published', true)
        ->firstOrFail();

    // Load related products manually
    $relatedProducts = Product::with('category')
        ->where('category_id', $product->category_id)
        ->where('id', '!=', $product->id)
        ->where('is_published', true)
        ->latest()
        ->take(4)
        ->get();

    // Attach as a relationship so whenLoaded() works
    $product->setRelation('relatedProducts', $relatedProducts); //"fake-load" the relationship.

    return new ProductResource($product);
}
}
