<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class AdminController extends Controller
{
   public function index(Request $request)
{
    $perPage = $request->input('per_page', 10); // default 10, adjustable
    $search = $request->input('search');

    $query = Product::with('category')
        ->latest();

    if ($search) {
        $query->where('title', 'like', "%{$search}%")
              ->orWhere('short_description', 'like', "%{$search}%");
    }

    $products = $query->paginate($perPage);

    return $products; // Laravel automatically returns { data, current_page, last_page, per_page, total, ... }
}
}
