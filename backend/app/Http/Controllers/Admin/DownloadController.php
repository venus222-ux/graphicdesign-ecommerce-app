<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class DownloadController extends Controller
{
    public function download(Product $product)
    {
        $this->authorize('view', $product);

        $media = $product->getFirstMedia('asset');

        if (!$media) {
            abort(404, 'Asset file not found');
        }

        return response()->download($media->getPath(), $media->file_name);
    }
}
