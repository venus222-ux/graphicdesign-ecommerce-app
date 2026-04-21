<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\Product;

class CartController extends Controller
{
    private function key()
    {
        return 'cart_' . auth()->id();
    }

    public function index()
    {
        return response()->json(
            Cache::get($this->key(), [])
        );
    }

    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required',
            'quantity' => 'required|integer|min:1'
        ]);

        $product = Product::findOrFail($request->product_id);

        $cart = Cache::get($this->key(), []);

        $found = false;

        foreach ($cart as &$item) {
            if ($item['product_id'] == $product->id) {
                $item['quantity'] += $request->quantity;
                $found = true;
            }
        }

        if (!$found) {
            $cart[] = [
                'product_id' => $product->id,
                'title' => $product->title,
                'price' => $product->price,
                'quantity' => $request->quantity,
            ];
        }

        Cache::put($this->key(), $cart, now()->addHours(2));

        return response()->json(['message' => 'Added to cart', 'cart' => $cart]);
    }

    public function remove($productId)
    {
        $cart = Cache::get($this->key(), []);

        $cart = array_values(array_filter($cart, function ($item) use ($productId) {
            return $item['product_id'] != $productId;
        }));

        Cache::put($this->key(), $cart, now()->addHours(2));

        return response()->json(['message' => 'Removed', 'cart' => $cart]);
    }

    public function clear()
    {
        Cache::forget($this->key());

        return response()->json(['message' => 'Cart cleared']);
    }
}
