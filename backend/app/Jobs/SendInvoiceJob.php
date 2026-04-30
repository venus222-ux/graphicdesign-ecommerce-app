<?php

namespace App\Jobs;

use App\Models\Order;
use App\Mail\InvoiceMail;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Mail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendInvoiceJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Order $order   // Keep only this
    ) {}

    public function handle()
    {
        try {
            $order = Order::with(['items.product', 'user'])
                ->findOrFail($this->order->id);

            if ($order->invoice_sent_at) {
                Log::info('Invoice already sent', ['order_id' => $order->id]);
                return;
            }

            Log::info('Starting invoice generation', ['order_id' => $order->id]);

            $pdf = Pdf::loadView('emails.invoice', compact('order'));

            // Save PDF using Spatie Media Library
            $media = $order->addMediaFromString($pdf->output())
                ->usingFileName("invoice-{$order->invoice_number}.pdf")
                ->toMediaCollection('invoices');

            $pdfPath = $media->getPath();   // Absolute path on server

            // Send the email with attachment
            Mail::to($order->user->email)
                ->send(new InvoiceMail($order, $pdfPath));

            $order->update(['invoice_sent_at' => now()]);

            Log::info('Invoice sent successfully', ['order_id' => $order->id]);

        } catch (\Throwable $e) {
            Log::error('SendInvoiceJob failed', [
                'order_id' => $this->order->id ?? null,
                'error'    => $e->getMessage(),
                'file'     => $e->getFile(),
                'line'     => $e->getLine(),
            ]);

            throw $e;
        }
    }

    public function failed(\Throwable $exception)
    {
        Log::critical('SendInvoiceJob permanently failed', [
            'order_id' => $this->order->id ?? null,
            'exception' => $exception->getMessage()
        ]);
    }
}
