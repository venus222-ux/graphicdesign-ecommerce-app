<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Events\FileUploaded;
use App\Http\Resources\ProductResource;
use App\Services\ProductMediaService;
use Illuminate\Support\Facades\Log;
use Throwable;
use App\Services\ProductSearchService;

class ProductController extends Controller
{
    /* ================= INDEX ================= */
public function index(Request $request)
{
    $perPage = $request->input('per_page', 10);
    $search = $request->input('search');

    $query = Product::with(['category', 'media'])   // ← ADD 'media' here
                    ->latest();

    if ($search) {
        $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('short_description', 'like', "%{$search}%");
        });
    }

    return $query->paginate($perPage);
}


public function store(
    StoreProductRequest $request,
    ProductSearchService $searchService,
    ProductMediaService $mediaService
) {
    try {
        $data = $request->validated();
        $data['slug'] = Str::slug($data['title']) . '-' . uniqid();
        $data['user_id'] = auth()->id();

        $product = Product::create($data);

        // Save multiple images
        $mediaService->syncPreviewImages($product);   // no true here

        if ($request->hasFile('asset_file')) {
            $product->addMedia($request->file('asset_file'))
                    ->toMediaCollection('asset');
        }

        $product->load('media');

        return response()->json([
            'message' => 'Product created',
            'data' => new ProductResource($product)
        ], 201);

    } catch (\Throwable $e) {
        return response()->json([
            'message' => 'Store failed',
            'error' => $e->getMessage(),
        ], 500);
    }
}



public function update(
    UpdateProductRequest $request,
    Product $product,
    ProductSearchService $searchService,
    ProductMediaService $mediaService
  ) {
    try {
        $data = $request->validated();

        if (isset($data['is_published'])) {
            $data['is_published'] = (bool) $data['is_published'];
        }

        if (isset($data['title']) && $data['title'] !== $product->title) {
            $data['slug'] = Str::slug($data['title']) . '-' . uniqid();
        }

        $product->update($data);

        // 🔥 REPLACE images clean
     $mediaService->syncPreviewImages($product, true);

        if ($request->hasFile('asset_file')) {
            $product->clearMediaCollection('asset');

            $media = $product
                ->addMedia($request->file('asset_file'))
                ->toMediaCollection('asset');

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
       $product->load('media');
        $searchService->index($product);

        return response()->json(
            new ProductResource($product->fresh()->load(['category', 'media'])),
            200
        );

    } catch (\Throwable $e) {
        return response()->json([
            'message' => 'Update failed',
            'error' => $e->getMessage(),
        ], 500);
    }
}


/**
 * Delete a product
 */
 public function destroy(Product $product, ProductSearchService $searchService)
{
    $id = $product->id;

    try {
        // This will throw ModelNotFoundException if the model binding fails,
        // but since you're using route model binding, it should already be loaded.
        $product->delete();   // or $product->forceDelete() if you want hard delete

    } catch (\Throwable $e) {
        Log::error('Failed to delete product from database', [
            'product_id' => $id,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        return response()->json([
            'message' => 'Failed to delete product from database',
            'error'   => config('app.debug') ? $e->getMessage() : null,
        ], 500);
    }

    /* ================= ELASTICSEARCH (NON-BLOCKING) ================= */
    try {
        $searchService->delete($id);
    } catch (\Throwable $e) {
        // Log the Elasticsearch error but **do not fail** the whole request
        // (the product is already deleted from DB — that's the source of truth)
        Log::warning('Failed to delete product from Elasticsearch', [
            'product_id' => $id,
            'error' => $e->getMessage(),
        ]);

        // You can still return success, or return a partial success message
    }

    return response()->json([
        'message' => 'Product deleted successfully'
    ]);
}
}

