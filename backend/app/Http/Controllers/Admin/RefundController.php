<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Refund;
use Illuminate\Http\Request;
use App\Services\RefundService;

class RefundController extends Controller
{
    public function refund(Request $request, $id, RefundService $refundService)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'nullable|string'
        ]);

        $order = Order::findOrFail($id);

        $refund = $refundService->refund(
            $order,
            $request->amount,
            $request->reason
        );

        return response()->json([
            'message' => 'Refund successful',
            'refund' => $refund
        ]);
    }

    public function index()
    {
        $refunds = Refund::with(['order.user', 'order.items.product'])
            ->latest()
            ->paginate(20);

        return response()->json($refunds);
    }
}
