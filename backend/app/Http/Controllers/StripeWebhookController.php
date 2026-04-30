<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Webhook;
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
            Log::error('Stripe webhook failed: ' . $e->getMessage());
            return response('Invalid', 400);
        }

        if ($event->type === 'checkout.session.completed') {

            $session = $event->data->object;

            $order = Order::where('stripe_session_id', $session->id)->first();

            if (!$order) {
                Log::warning('Order not found');
                return;
            }

            if ($order->status !== 'paid') {

                $order->update([
                    'status' => 'paid',
                ]);

                $this->grantAccess($order);

                SendInvoiceJob::dispatch($order)->onQueue('emails');

                Log::info('Invoice job dispatched', [
                    'order_id' => $order->id
                ]);
            }
        }

        return response()->json(['status' => 'success']);
    }

    private function grantAccess($order)
    {
        foreach ($order->items as $item) {
            $order->user->products()->syncWithoutDetaching([
                $item->product_id
            ]);
        }
    }
}
