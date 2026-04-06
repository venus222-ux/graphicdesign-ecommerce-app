<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Events\FileUploaded;
use Illuminate\Support\Facades\Log;
use Throwable;
use App\Services\ProductSearchService;

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
  public function store(StoreProductRequest $request, ProductSearchService $searchService)
{
    try {
        Log::info('Store product started', ['data' => $request->validated()]);

        $data = $request->validated();
        $data['slug'] = Str::slug($data['title']) . '-' . uniqid();
        $data['user_id'] = auth()->id();

        $product = Product::create($data);
        Log::info('Product created', ['product_id' => $product->id]);

        // Handle multiple preview images
        if ($request->hasFile('preview_images')) {
            $product->addMultipleMediaFromRequest(['preview_images'])
                    ->each(function ($fileAdder) {
                        $fileAdder->toMediaCollection('previews');
                    });
            Log::info('Multiple preview images saved');
        }

        // Handle asset file (single)
        if ($request->hasFile('asset_file')) {
            $media = $product->addMediaFromRequest('asset_file')->toMediaCollection('asset');

            FileUploaded::dispatch(
                $product,
                [
                    'file_name' => $media->file_name,
                    'size' => $media->size,
                    'mime' => $media->mime_type,
                    'path' => $media->getPath(),
                ],
                auth()->user(),
                $request->ip(),
                $request->userAgent()
            );
            Log::info('Asset file saved and event dispatched');
        }

        $searchService->index($product);

        return response()->json($product->load('category'), 201);

    } catch (Throwable $e) {
        Log::error('Product store failed', [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'data' => $request->validated(),
            'has_previews' => $request->hasFile('preview_images'),
            'has_asset' => $request->hasFile('asset_file'),
        ]);

        return response()->json([
            'message' => 'Failed to create product',
            'error' => $e->getMessage(),
        ], 500);
    }
}

    /**
     * Update an existing product
     */

  public function update(UpdateProductRequest $request, Product $product, ProductSearchService $searchService)
  {
    $data = $request->validated();

    // Force boolean 0/1 for is_published if sent
    if (isset($data['is_published'])) {
        $data['is_published'] = $data['is_published'] ? 1 : 0;
    }

    // Update slug if title changes
    if (isset($data['title']) && $data['title'] !== $product->title) {
        $data['slug'] = Str::slug($data['title']) . '-' . uniqid();
    }

    // Update product
    $product->update($data);

    // Handle multiple preview images (replace all)
    if ($request->hasFile('preview_images')) {
        $product->clearMediaCollection('previews');
        $product->addMultipleMediaFromRequest(['preview_images'])
                ->each(function ($fileAdder) {
                    $fileAdder->toMediaCollection('previews');
                });
    }

    // Handle asset file (replace existing)
    if ($request->hasFile('asset_file')) {
        $product->clearMediaCollection('asset');
        $media = $product->addMediaFromRequest('asset_file')->toMediaCollection('asset');

        FileUploaded::dispatch(
            $product,
            [
                'file_name' => $media->file_name,
                'size' => $media->size,
                'mime' => $media->mime_type,
                'path' => $media->getPath(),
            ],
            auth()->user(),
            $request->ip(),
            $request->userAgent()
        );
    }

    // Reindex in search
    $searchService->index($product);

    return response()->json($product->fresh()->load('category'), 200);
  }
    /**
     * Delete a product
     */
    public function destroy(Product $product, ProductSearchService $searchService)
    {
        $product->delete();
        $searchService->delete($product->id);
        return response()->json(['message' => 'Product deleted successfully']);
    }
}
