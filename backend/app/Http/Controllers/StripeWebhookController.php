<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Webhook;
use Stripe\Checkout\Session as StripeSession;
use App\Models\Order;
use Illuminate\Support\Facades\Log;
use App\Jobs\SendInvoiceJob;

class StripeWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        try {
            $event = Webhook::constructEvent(
                $payload,
                $sigHeader,
                config('services.stripe.webhook_secret')
            );
        } catch (\Exception $e) {
            Log::error('Stripe webhook signature failed', ['error' => $e->getMessage()]);
            return response('Invalid signature', 400);
        }

        if ($event->type === 'checkout.session.completed') {
            $sessionData = $event->data->object;
            $sessionId = $sessionData->id;

            Log::info('Checkout session completed received', ['session_id' => $sessionId]);

            // === Retrieve with expansion (this is the key) ===
            try {
                $session = StripeSession::retrieve([
                    'id' => $sessionId,
                    'expand' => ['payment_intent']
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to retrieve session', [
                    'session_id' => $sessionId,
                    'error' => $e->getMessage()
                ]);
                return response()->json(['status' => 'ok'], 200);
            }

            $paymentIntentId = null;
            if ($session->payment_intent) {
                $paymentIntentId = is_object($session->payment_intent)
                    ? $session->payment_intent->id
                    : $session->payment_intent;
            }

            Log::info('Session expanded', [
                'session_id' => $sessionId,
                'payment_intent' => $paymentIntentId ?? 'NULL'
            ]);

            $order = Order::where('stripe_session_id', $sessionId)->first();

            if (!$order) {
                Log::warning('Order not found', ['session_id' => $sessionId]);
                return response()->json(['status' => 'order_not_found']);
            }

            if ($order->status !== 'paid' && $paymentIntentId) {
                $order->update([
                    'status' => 'paid',
                    'payment_intent_id' => $paymentIntentId,
                ]);

                $this->grantAccess($order);
                SendInvoiceJob::dispatch($order)->onQueue('emails');

                Log::info('🎉 Order marked as PAID with PaymentIntent', [
                    'order_id' => $order->id,
                    'payment_intent_id' => $paymentIntentId
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
