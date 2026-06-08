<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Webhook;
use Stripe\Checkout\Session as StripeSession;
use App\Models\Order;
use Illuminate\Support\Facades\Log;
use App\Events\OrderPaid;
use Throwable;

class StripeWebhookController extends Controller
{
    public function handle(Request $request)
    {
        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

        Log::info('--- WEBHOOK HIT ---');

        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        try {
            $webhookSecret = '';
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (Throwable $e) {
            Log::error('❌ Webhook signature verification FAILED: ' . $e->getMessage());
            return response('Invalid signature', 400);
        }

        if ($event->type === 'checkout.session.completed') {
            Log::info('✅ Processing checkout.session.completed');

            $sessionId = $event->data->object->id ?? null;

            try {
                Log::info('DEBUG: Retrieving Stripe session: ' . $sessionId);
                $session = StripeSession::retrieve($sessionId, ['expand' => ['payment_intent']]);

                Log::info('DEBUG: Looking up order in DB...');
                $order = Order::where('stripe_session_id', $sessionId)->first();

                if (!$order) {
                    Log::warning('DEBUG: Order not found for session', ['session_id' => $sessionId]);
                    return response()->json(['status' => 'order_not_found'], 200);
                }

                if ($order->status !== 'paid') {
                    Log::info('DEBUG: Order found, status is ' . $order->status . '. Updating...');
                    $order->update(['status' => 'paid']);

                    Log::info("DEBUG: Dispatching to connection: redis, queue: emails");

                    $job = new \App\Jobs\ProcessOrderPaid($order);
                    $job->onConnection('redis')->onQueue('emails');

                    dispatch($job);

                    Log::info('🚀 ProcessOrderPaid job dispatched to queue successfully');
                } else {
                    Log::info('DEBUG: Order already paid, skipping dispatch.');
                }
            } catch (Throwable $e) {
                // This is the critical change: \Throwable catches everything
                Log::error('❌ FATAL ERROR in StripeWebhookController: ' . $e->getMessage());
                Log::error('❌ File: ' . $e->getFile() . ' Line: ' . $e->getLine());
                Log::error('❌ Trace: ' . $e->getTraceAsString());
                return response()->json(['status' => 'error', 'message' => 'Internal processing error'], 500);
            }
        }

        return response()->json(['status' => 'success']);
    }
}
