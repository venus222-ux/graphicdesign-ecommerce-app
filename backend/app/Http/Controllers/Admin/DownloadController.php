<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class DownloadController extends Controller
{
    public function download(Product $product)
    {
        $this->authorize('view', $product); // IMPORTANT (security)

        $media = $product->getFirstMedia('asset');

        if (!$media) {
            abort(404);
        }

        return response()->download($media->getPath(), $media->file_name);
    }
}
