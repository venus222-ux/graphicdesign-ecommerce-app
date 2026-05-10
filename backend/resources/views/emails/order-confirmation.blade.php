<!-- //app/resource/views/emails/order-confirmation.blade.php -->
@component('mail::message')
# Thank You for Your Purchase! 🎉

Hi **{{ $order->user->name ?? 'Valued Customer' }}**,

Thank you for shopping with us. Your payment has been successfully processed.

### Order Details
**Order #{{ $order->id }}**
**Date:** {{ $order->created_at->format('F d, Y \a\t H:i') }}

---

### Purchased Items

@foreach($order->items as $item)
**{{ $item->product->title ?? 'Digital Product' }}**
Qty: {{ $item->quantity }} × ${{ number_format($item->price, 2) }} = **${{ number_format($item->price * $item->quantity, 2) }}**

@endforeach

---

**Subtotal:** ${{ number_format($order->subtotal, 2) }}
**VAT (21%):** ${{ number_format($order->vat, 2) }}
**Total Paid:** **${{ number_format($order->total, 2) }}**

---

Your files are ready to download. You can also access them anytime from your account.

If you have any questions, just reply to this email.

Thank you again for your support!

**Best regards,**
**Your Marketplace Team**
@endcomponent
