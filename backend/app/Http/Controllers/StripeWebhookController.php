<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Webhook;
use Stripe\Checkout\Session as StripeSession;
use App\Models\Order;
use Illuminate\Support\Facades\Log;
use App\Events\OrderPaid;

class StripeWebhookController extends Controller
{
    public function handle(Request $request)
    {
        Log::info('=== STRIPE WEBHOOK RAW REQUEST ===', [
            'has_payload' => !empty($request->getContent()),
            'signature_present' => $request->header('Stripe-Signature') ? 'YES' : 'NO',
            'ip' => $request->ip()
        ]);

        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        try {
            $event = Webhook::constructEvent(
                $payload,
                $sigHeader,
                config('services.stripe.webhook_secret')
            );

            Log::info('✅ Webhook signature verified successfully', [
                'event_type' => $event->type
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Webhook signature verification FAILED', [
                'error' => $e->getMessage(),
                'signature' => substr($sigHeader ?? '', 0, 50) . '...',
            ]);

            return response('Invalid signature', 400);
        }

        // Only handle checkout completed
        if ($event->type === 'checkout.session.completed') {

            Log::info('✅ Processing checkout.session.completed');

            $sessionId = $event->data->object->id ?? null;

            try {
                $session = StripeSession::retrieve([
                    //'id' => $sessionId,
                    'expand' => ['payment_intent']
                ]);

                $paymentIntentId = $session->payment_intent?->id ?? $session->payment_intent;

                $order = Order::where('stripe_session_id', $sessionId)->first();

                if (!$order) {
                    Log::warning('Order not found for session', ['session_id' => $sessionId]);
                    return response()->json(['status' => 'order_not_found'], 200);
                }

                if ($order->status !== 'paid') {
                    $order->update([
                        'status' => 'paid',
                        'payment_intent_id' => $paymentIntentId,
                    ]);

                    $this->grantAccess($order);

                    Log::info('💰 Order marked as PAID', ['order_id' => $order->id]);

                    event(new OrderPaid($order));

                    Log::info('🚀 OrderPaid event dispatched');
                }

            } catch (\Exception $e) {
                Log::error('Error processing webhook', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }
        }

        return response()->json(['status' => 'success']);
    }

    private function grantAccess($order)
    {
        foreach ($order->items as $item) {
            $order->user->products()->syncWithoutDetaching($item->product_id);
        }
    }
}
