<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Display a listing of products with pagination + search support
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search  = $request->input('search');

        $query = Product::with('category')->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    /**
     * Store a newly created product
     */
public function store(StoreProductRequest $request)
{
    $data = $request->validated();

    $data['slug'] = Str::slug($data['title']) . '-' . uniqid();

    // Set user_id only if authenticated, otherwise null (now allowed)
    $data['user_id'] = auth()->check() ? auth()->id() : null;

    $product = Product::create($data);

    return $product->load('category');
}
    public function show(Product $product)
    {
        return $product->load('category');
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $data = $request->validated();

        $product->update($data);

        return $product->load('category');   // better for frontend
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }
}
