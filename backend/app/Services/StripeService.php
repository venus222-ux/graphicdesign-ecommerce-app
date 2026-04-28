<?php

namespace App\Services;

use Stripe\Stripe;
use Stripe\Checkout\Session;

class StripeService
{
    public function __construct()
    {
        // ✅ REQUIRED
        Stripe::setApiKey(config('services.stripe.secret'));
    }

public function createCheckoutSession($order)
{
    $lineItems = [];

    foreach ($order->items as $item) {
        // 🔒 Safety check (prevents crash if product missing)
        if (!$item->product) {
            continue;
        }

        $lineItems[] = [
            'price_data' => [
                'currency' => 'usd',
                'product_data' => [
                    'name' => $item->product->title,
                ],
                // ✅ Stripe uses cents
                'unit_amount' => (int) ($item->price * 100),
            ],
            'quantity' => $item->quantity,
        ];
    }
        return Session::create([
            'payment_method_types' => ['card'],
            'line_items' => $lineItems,
            'mode' => 'payment',

            // 🔥 CRITICAL FIX (you were missing session_id)
            'success_url' => config('app.url') . '/success?session_id={CHECKOUT_SESSION_ID}',

            // ✅ cancel URL
            'cancel_url' => config('app.url') . '/cancel',
        ]);
    }
}
