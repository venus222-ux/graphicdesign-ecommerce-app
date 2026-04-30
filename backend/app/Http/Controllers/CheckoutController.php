<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\StripeService;
use Illuminate\Support\Facades\Log;

class CheckoutController extends Controller
{
   private function key()
{
    if (!auth()->check()) {
        abort(401, 'Unauthorized');
    }

    return 'cart_' . auth()->id();
}

public function checkout(Request $request, StripeService $stripe)
{
    $cart = $request->input('items', []);

    if (empty($cart)) {
        return response()->json(['message' => 'Cart is empty'], 400);
    }

    DB::beginTransaction();

    try {
        $total = 0;

        $order = Order::create([
            'user_id' => auth()->id(),
            'total' => 0,
            'status' => 'pending'
        ]);

        foreach ($cart as $item) {
            $product = Product::findOrFail($item['id']);

            if (!$product->is_published) {
                throw new \Exception('Product unavailable');
            }

            $price = $product->price;
            $total += $price * $item['quantity'];

            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'quantity' => $item['quantity'],
                'price' => $price,
            ]);
        }

        // 🔥 VAT CALCULATION
        $vatRate = 0.21;
        $subtotal = $total;
        $vat = $subtotal * $vatRate;
        $grandTotal = $subtotal + $vat;

        // 💾 Update order BEFORE Stripe session
        $order->update([
            'total' => $grandTotal,
            'vat' => $vat * 100,
        ]);

        $order->load('items.product');

        // 🚀 CREATE STRIPE SESSION
        $session = $stripe->createCheckoutSession($order);

        // 💾 NOW SAVE SESSION ID (AFTER IT EXISTS)
        $order->update([
            'stripe_session_id' => $session->id,
        ]);

        DB::commit();

        return response()->json([
            'url' => $session->url
        ]);

    } catch (\Throwable $e) {
        DB::rollBack();

        Log::error($e);

        return response()->json([
            'message' => 'Checkout failed',
            'error' => $e->getMessage()
        ], 500);
    }
}


public function verify(Request $request)
{
    $sessionId = $request->query('session_id');

    $order = Order::with('items.product')
        ->where('stripe_session_id', $sessionId)
        ->firstOrFail();

    // 🔥 SAFE CHECK: allow Stripe delay
    if ($order->status !== 'paid') {

        // OPTIONAL: auto-retry sync with Stripe webhook fallback
        return response()->json([
            'message' => 'Payment processing',
            'order' => $order
        ], 202);
    }

    return response()->json([
        'message' => 'Payment successful',
        'order' => $order,
    ]);
}


}
