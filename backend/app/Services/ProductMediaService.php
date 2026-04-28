<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Http\UploadedFile;

class ProductMediaService
{
    public function syncPreviewImages(Product $product, $files, bool $replace = false): void
    {
        if ($replace) {
            $product->clearMediaCollection('previews');
        }

        if (!$files) return;

        $files = is_array($files) ? $files : [$files];

        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $product
                    ->addMedia($file)
                    ->toMediaCollection('previews');
            }
        }
    }
}
