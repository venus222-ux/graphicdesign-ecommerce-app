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
            ->findOrFail($id) ;
    }


public function invoice($id)
{
    $order = Order::with(['items.product', 'user'])
        ->where('user_id', auth()->id())
        ->findOrFail($id);

    $fileName = "invoice-{$order->invoice_number}.pdf";

    // ✅ If already exists → return it (NO regenerate)
    $existing = $order->getFirstMedia('invoices');

    if ($existing) {
        return response()->download($existing->getPath(), $fileName);
    }

    // 🔥 1. Ensure directory exists (GOOD PRACTICE, but not required for Spatie)
    Storage::makeDirectory('invoices');

    // 🔥 2. Generate PDF
    $pdf = Pdf::loadView('emails.invoice', compact('order'));

    // 🔥 3. Save via Spatie (THIS is what matters)
    $order
        ->addMediaFromString($pdf->output())
        ->usingFileName($fileName)
        ->toMediaCollection('invoices');

    // 🔥 4. Retrieve saved file
    $media = $order->getFirstMedia('invoices');

    if (!$media) {
        abort(500, 'Invoice generation failed');
    }

    return response()->download($media->getPath(), $fileName);
}
}
