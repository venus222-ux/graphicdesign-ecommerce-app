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

    $user = auth()->user();

    $validated = $request->validate([
        'billing.company_name'      => 'nullable|string|max:255',
        'billing.vat_number'        => 'nullable|string|max:50',
        'billing.address_line_1'    => 'required|string|max:255',
        'billing.address_line_2'    => 'nullable|string|max:255',
        'billing.city'              => 'required|string|max:100',
        'billing.state'             => 'nullable|string|max:100',
        'billing.postal_code'       => 'required|string|max:20',
        'billing.country'           => 'required|string|size:2',
        'save_to_profile'           => 'boolean|nullable',
    ]);

    $billing = $validated['billing'];
    $saveToProfile = $validated['save_to_profile'] ?? false;

    DB::beginTransaction();

    try {
        $subtotal = 0;

        // Calculate subtotal first
        foreach ($cart as $item) {
            $product = Product::findOrFail($item['id']);
            $quantity = (int) $item['quantity'];
            $price = (float) $product->price;
            $subtotal += $price * $quantity;
        }

        $vat = round(($subtotal * 21) / 100, 2);
        $total = $subtotal + $vat;

        // Create Order with all fields
        $order = Order::create([
            'user_id'           => $user->id,
            'status'            => 'pending',

            'subtotal'          => round($subtotal, 2),
            'vat_percent'       => 21,
            'vat'               => $vat,
            'total'             => $total,

            'billing_name'      => $user->name ?? 'Customer',
            'billing_email'     => $user->email,

            'billing_company'     => $billing['company_name'] ?? $user->company_name,
            'billing_vat_number'  => $billing['vat_number'] ?? $user->vat_number,

            'billing_address_1'   => $billing['address_line_1'],
            'billing_address_2'   => $billing['address_line_2'] ?? null,

            'billing_city'        => $billing['city'],
            'billing_state'       => $billing['state'] ?? null,
            'billing_postal_code' => $billing['postal_code'],
            'billing_country'     => $billing['country'],
        ]);

        // Create Order Items
        foreach ($cart as $item) {
            $product = Product::findOrFail($item['id']);

            OrderItem::create([
                'order_id'   => $order->id,
                'product_id' => $product->id,
                'quantity'   => (int) $item['quantity'],
                'price'      => (float) $product->price,
            ]);
        }

        // Auto-save billing to profile
        if ($saveToProfile) {
            $user->update([
                'company_name'   => $billing['company_name'],
                'vat_number'     => $billing['vat_number'],
                'address_line_1' => $billing['address_line_1'],
                'address_line_2' => $billing['address_line_2'] ?? null,
                'city'           => $billing['city'],
                'state'          => $billing['state'] ?? null,
                'postal_code'    => $billing['postal_code'],
                'country'        => $billing['country'],
            ]);
        }

        $order->load(['items.product', 'user']);

        $session = $stripe->createCheckoutSession($order);
        $order->update(['stripe_session_id' => $session->id]);

        DB::commit();

        return response()->json(['url' => $session->url]);

    } catch (\Throwable $e) {
        DB::rollBack();
        Log::error('Checkout failed', ['error' => $e->getMessage()]);

        return response()->json([
            'message' => 'Checkout failed',
            'error'   => $e->getMessage()
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
