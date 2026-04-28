<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class DownloadController extends Controller
{

public function download(Product $product)
{
    $user = auth()->user();

    // 🔐 CHECK IF USER OWNS THE PRODUCT
    if (!$user->products()->where('product_id', $product->id)->exists()) {
        abort(403, 'You do not own this product');
    }

    $media = $product->getFirstMedia('asset');

    if (!$media) {
        abort(404, 'Asset file not found');
    }

    return response()->download($media->getPath(), $media->file_name);
}

}
