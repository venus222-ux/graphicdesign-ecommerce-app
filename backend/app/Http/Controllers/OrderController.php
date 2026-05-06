<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class OrderController extends Controller
{
    public function index()
    {
        return Order::with('items.product')
            ->where('user_id', auth()->id())
            ->latest()
            ->get();
    }

    public function show($id)
    {
        return Order::with('items.product')
            ->where('user_id', auth()->id())
            ->findOrFail($id);
    }

    // ================== ADMIN METHODS ==================

    public function adminShow($id)
    {
        $order = Order::with(['items.product', 'user'])
            ->findOrFail($id);

        return response()->json($order);
    }

    public function adminInvoice($id)
    {
        $order = Order::with(['items.product', 'user'])
            ->findOrFail($id);

        $fileName = "invoice-{$order->invoice_number}.pdf";

        $existing = $order->getFirstMedia('invoices');

        if ($existing) {
            return response()->download($existing->getPath(), $fileName);
        }

        // Generate PDF
        $pdf = Pdf::loadView('emails.invoice', compact('order'))
                  ->setPaper('a4', 'portrait');

        $order
            ->addMediaFromString($pdf->output())
            ->usingFileName($fileName)
            ->toMediaCollection('invoices');

        return response()->download(
            $order->getFirstMedia('invoices')->getPath(),
            $fileName
        );
    }

    // Helper method (in case you want to reuse it later)
    private function generateInvoicePdf($order)
    {
        return Pdf::loadView('emails.invoice', compact('order'))
                  ->setPaper('a4', 'portrait');
    }
}
