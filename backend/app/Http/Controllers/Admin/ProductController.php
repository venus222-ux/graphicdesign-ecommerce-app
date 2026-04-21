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
    /* ================= INDEX ================= */
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

public function store(StoreProductRequest $request, ProductSearchService $searchService)
{
    try {
        $data = $request->validated();
        $data['slug'] = Str::slug($data['title']) . '-' . uniqid();
        $data['user_id'] = auth()->id();

        $product = Product::create($data);

        // media safe
        if ($request->hasFile('preview_images')) {
            foreach ($request->file('preview_images') as $file) {
                $product->addMedia($file)->toMediaCollection('previews');
            }
        }

        if ($request->hasFile('asset_file')) {
            $product->clearMediaCollection('asset');

            $media = $product
                ->addMedia($request->file('asset_file'))
                ->toMediaCollection('asset');
        }

      

        return response()->json([
            'message' => 'Product created',
            'data' => $product->load(['category', 'media'])
        ], 201);

    } catch (\Throwable $e) {
        Log::error('STORE FAILED', [
            'error' => $e->getMessage()
        ]);

        return response()->json([
            'message' => 'Failed to create product'
        ], 500);
    }
}

    /* ================= UPDATE ================= */
    public function update(UpdateProductRequest $request, Product $product, ProductSearchService $searchService)
    {
        try {
            $data = $request->validated();

            if (isset($data['is_published'])) {
                $data['is_published'] = (bool) $data['is_published'];
            }

            if (isset($data['title']) && $data['title'] !== $product->title) {
                $data['slug'] = Str::slug($data['title']) . '-' . uniqid();
            }

            $product->update($data);

            /* ================= REPLACE PREVIEW IMAGES ================= */
            if ($request->hasFile('preview_images')) {

                $product->clearMediaCollection('previews');

                foreach ($request->file('preview_images') as $file) {
                    $product
                        ->addMedia($file)
                        ->toMediaCollection('previews');
                }
            }

            /* ================= REPLACE ASSET ================= */
            if ($request->hasFile('asset_file')) {
                $product->clearMediaCollection('asset');

                $media = $product
                    ->addMediaFromRequest('asset_file')
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

            $searchService->index($product);

            return response()->json(
                $product->fresh()->load('category'),
                200
            );

        } catch (Throwable $e) {
            Log::error('Product update failed', [
                'message' => $e->getMessage(),
            ]);

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

