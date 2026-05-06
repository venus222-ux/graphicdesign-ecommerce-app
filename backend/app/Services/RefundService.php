<?php

namespace App\Services;

use Stripe\Stripe;
use Stripe\Refund;
use App\Models\Order;
use App\Models\Refund as RefundModel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RefundService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function refund(Order $order, float $amount, string $reason = null)
    {
        /**
         * 🔥 RECOVER payment_intent IF MISSING
         */
        if (empty($order->payment_intent_id) && !empty($order->stripe_session_id)) {

            Log::warning('Missing payment_intent_id, attempting recovery', [
                'order_id' => $order->id
            ]);

            try {
                $session = \Stripe\Checkout\Session::retrieve([
                    'id' => $order->stripe_session_id,
                    'expand' => ['payment_intent']
                ]);

                $pi = $session->payment_intent;
                $paymentIntentId = is_object($pi) ? $pi->id : $pi;

                if ($paymentIntentId) {
                    $order->update([
                        'payment_intent_id' => $paymentIntentId
                    ]);

                    Log::info('Recovered payment_intent_id', [
                        'order_id' => $order->id,
                        'payment_intent' => $paymentIntentId
                    ]);
                }

            } catch (\Exception $e) {
                Log::error('Failed to recover payment intent', [
                    'order_id' => $order->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        /**
         * ❌ STILL MISSING → HARD FAIL
         */
        if (!$order->payment_intent_id) {
            throw new \Exception('Missing payment intent - cannot refund');
        }

        /**
         * ❌ OVER-REFUND PROTECTION
         */
        if ($amount > ($order->total - $order->refunded_total)) {
            throw new \Exception('Refund exceeds available amount');
        }

        DB::beginTransaction();

        try {
            /**
             * 🔥 STRIPE REFUND
             */
            $refund = Refund::create([
                'payment_intent' => $order->payment_intent_id,
                'amount' => (int) ($amount * 100),
            ]);

            /**
             * 🔥 CREDIT NOTE NUMBER
             */
            $creditNumber = 'CN-' . date('Y') . '-' . str_pad(
                RefundModel::count() + 1,
                4,
                '0',
                STR_PAD_LEFT
            );

            /**
             * 💾 SAVE LOCALLY
             */
            $refundModel = RefundModel::create([
                'order_id' => $order->id,
                'amount' => $amount,
                'reason' => $reason,
                'stripe_refund_id' => $refund->id,
                'credit_note_number' => $creditNumber,
            ]);

            /**
             * 🔥 UPDATE ORDER
             */
            $order->increment('refunded_total', $amount);

            if ($order->refunded_total >= $order->total) {
                $order->update(['status' => 'refunded']);
            }

            DB::commit();

            return $refundModel;

        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Refund failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }
}
