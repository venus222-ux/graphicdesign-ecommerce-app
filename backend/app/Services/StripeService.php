<?php

namespace App\Services;

use Stripe\Stripe;
use Stripe\Checkout\Session;
use App\Models\Order;

class StripeService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function createCheckoutSession(Order $order): Session
    {
        $lineItems = [];

        foreach ($order->items as $item) {

            if (!$item->product) {
                continue;
            }

            $product = $item->product;

            // ✅ Use centralized discount logic
            $finalPrice = $product->final_price;

            $lineItems[] = [
                'price_data' => [
                    'currency' => 'usd',

                    'product_data' => [
                        'name' => $product->title,

                        // Optional
                        'description' => $product->short_description,
                    ],

                    // Stripe requires cents
                    'unit_amount' => (int) round($finalPrice * 100),
                ],

                'quantity' => $item->quantity,
            ];
        }

        return Session::create([
            'payment_method_types' => ['card'],

            'line_items' => $lineItems,

            'mode' => 'payment',

            'success_url' =>
                'http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}',

            'cancel_url' =>
                'http://localhost:5173/cancel',

            'metadata' => [
                'order_id' => (string) $order->id,
                'user_id' => (string) $order->user_id,
            ],

            'payment_intent_data' => [
                'metadata' => [
                    'order_id' => (string) $order->id,
                    'user_id' => (string) $order->user_id,
                ],
            ],
        ]);
    }
}
