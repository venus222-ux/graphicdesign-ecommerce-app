<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {

    return [
        'title' => 'required|string|max:255',
        'short_description' => 'required|string|max:255',
        'description' => 'required|string',
        'price' => 'required|numeric|min:0',
        'asset_type' => 'required|string',
        'category_id' => 'required|exists:categories,id',
        'is_published' => 'required|boolean', // <-- ensures true or false

        // Files
        'preview_images' => 'nullable|array',
        'preview_images.*' => 'image|mimes:jpeg,png,jpg,webp,gif|max:5120',
        'asset_file' => 'nullable|file|mimes:zip,rar,pdf,psd|max:102400', // 100 MB
    ];
}
    }

