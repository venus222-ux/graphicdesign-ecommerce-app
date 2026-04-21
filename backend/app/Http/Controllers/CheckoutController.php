<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\Product;

class CheckoutController extends Controller
{
    private function key()
    {
        return 'cart_' . auth()->id();
    }

    public function checkout(Request $request)
    {
        $cart = Cache::get($this->key(), []);

        if (empty($cart)) {
            return response()->json([
                'message' => 'Cart is empty'
            ], 400);
        }

        $total = 0;

        foreach ($cart as $item) {
            $product = Product::findOrFail($item['product_id']);

            if (!$product->is_published) {
                return response()->json([
                    'message' => 'Product not available'
                ], 400);
            }

            $total += $product->price * $item['quantity'];
        }

        // 💡 HERE: Stripe later

        Cache::forget($this->key());

        return response()->json([
            'message' => 'Order placed successfully',
            'total' => $total
        ]);
    }
}
