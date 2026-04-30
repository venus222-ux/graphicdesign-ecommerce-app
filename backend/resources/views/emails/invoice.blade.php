<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice #{{ $order->id }}</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 14px; line-height: 1.6; color: #333; margin: 0; padding: 40px; }

        .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 28px; color: #000; text-transform: uppercase; letter-spacing: 1px; }
        .header p { margin: 5px 0; color: #666; }

        .flex-container { display: table; width: 100%; margin-bottom: 30px; }
        .column { display: table-cell; width: 50%; vertical-align: top; }

        h3 { border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px; font-size: 16px; color: #444; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background-color: #f8f8f8; text-align: left; padding: 12px; border-bottom: 2px solid #ddd; }
        td { padding: 12px; border-bottom: 1px solid #eee; }

        .total-row { font-size: 18px; font-weight: bold; background-color: #f9f9f9; }
        .total-row td { border-bottom: none; }

        .footer { margin-top: 50px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
    </style>
</head>
<body>

<div class="header">
    <h1>Invoice</h1>
    <p><strong>Order #{{ $order->id }}</strong> | {{ $order->created_at->format('M d, Y') }}</p>
</div>

<div class="flex-container">
    <div class="column">
        <h3>Bill To</h3>
        <strong>{{ $order->user->name }}</strong><br>
        {{ $order->user->email }}<br>
        Example Street 123<br>
        +40 700 000 000
    </div>
    <div class="column">
        <h3>From</h3>
        <strong>My Marketplace</strong><br>
        store@email.com<br>
        Bucharest, Romania<br>
        +40 700 111 222
    </div>
</div>

<table>
    <thead>
        <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
        </tr>
    </thead>

    <tbody>
        @foreach($order->items as $item)
            <tr>
                <td>{{ $item->product->title }}</td>
                <td>{{ $item->quantity }}</td>
                <td>${{ number_format($item->price, 2) }}</td>
                <td>${{ number_format($item->price * $item->quantity, 2) }}</td>
            </tr>
        @endforeach

        {{-- 🔥 SUBTOTAL --}}
        <tr>
            <td colspan="3" style="text-align: right;">Subtotal</td>
            <td>${{ number_format($order->total - $order->vat, 2) }}</td>
        </tr>

        {{-- 🔥 VAT --}}
        <tr>
            <td colspan="3" style="text-align: right;">VAT (21%)</td>
            <td>${{ number_format($order->vat, 2) }}</td>
        </tr>

        {{-- 🔥 GRAND TOTAL --}}
        <tr class="total-row">
            <td colspan="3" style="text-align: right;">GRAND TOTAL</td>
            <td>${{ number_format($order->total, 2) }}</td>
        </tr>
    </tbody>
</table>

<div class="footer">
    <p>Thank you for your business! Please keep this invoice for your records.</p>
</div>

</body>
</html>
