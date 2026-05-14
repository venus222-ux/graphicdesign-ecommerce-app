<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'short_description' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric|min:0',
            'asset_type' => 'sometimes|required|string',
            'category_id' => 'sometimes|required|exists:categories,id',
            'is_published' => 'sometimes|boolean',

            'preview_images' => 'nullable|array',
            'preview_images.*' => 'image|mimes:jpeg,png,jpg,webp,gif|max:5120',

            'asset_file' => 'nullable|file|max:102400',
        ];
    }
}
