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
        return response()->json([
            'message' => 'Cart is empty'
        ], 400);
    }

    DB::beginTransaction();

    try {
        $subtotal = 0;

        // CREATE ORDER
        $order = Order::create([
            'user_id' => auth()->id(),
            'subtotal' => 0,
            'vat_percent' => 21,
            'vat' => 0,
            'total' => 0,
            'status' => 'pending',
        ]);

        // CREATE ORDER ITEMS
        foreach ($cart as $item) {

            $product = Product::findOrFail($item['id']);

            if (!$product->is_published) {
                throw new \Exception('Product unavailable');
            }

            $quantity = (int) $item['quantity'];

            $price = (float) $product->price;

            $lineTotal = $price * $quantity;

            $subtotal += $lineTotal;

            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'price' => $price, // snapshot price
            ]);
        }

        // VAT CALCULATION
        $vatPercent = 21;

        $vat = ($subtotal * $vatPercent) / 100;

        $grandTotal = $subtotal + $vat;

        // UPDATE ORDER TOTALS
        $order->update([
            'subtotal' => round($subtotal, 2),
            'vat_percent' => $vatPercent,
            'vat' => round($vat, 2),
            'total' => round($grandTotal, 2),
        ]);

        // LOAD RELATIONS
        $order->load([
            'items.product',
            'user'
        ]);

        // CREATE STRIPE SESSION
        $session = $stripe->createCheckoutSession($order);

        // SAVE STRIPE SESSION ID
        $order->update([
            'stripe_session_id' => $session->id,
        ]);

        DB::commit();

        return response()->json([
            'url' => $session->url
        ]);

    } catch (\Throwable $e) {

        DB::rollBack();

        Log::error('Checkout failed', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        return response()->json([
            'message' => 'Checkout failed',
            'error' => $e->getMessage(),
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
