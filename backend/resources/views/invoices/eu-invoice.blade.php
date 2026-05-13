<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $order->invoice_number }}</title>
    <style>
        :root {
            --primary: #4f46e5;
            --dark: #1f2937;
            --gray-light: #f3f4f6;
            --gray-text: #6b7280;
        }

        body {
            font-family: 'Inter', 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
            font-size: 10pt;
            color: var(--dark);
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }

        .invoice-box {
            max-width: 850px;
            margin: auto;
            padding: 40px;
            background: #fff;
        }

        /* Header Section */
        .header-table {
            width: 100%;
            margin-bottom: 40px;
            border-bottom: 2px solid var(--gray-light);
            padding-bottom: 20px;
        }

        .brand-name {
            font-size: 22pt;
            font-weight: 800;
            color: var(--primary);
            letter-spacing: -1px;
            margin: 0;
        }

        .company-details {
            color: var(--gray-text);
            font-size: 9pt;
            margin-top: 5px;
        }

        /* Info Grid */
        .info-grid {
            width: 100%;
            margin-bottom: 40px;
        }

        .info-label {
            text-transform: uppercase;
            font-size: 8pt;
            font-weight: 700;
            color: var(--gray-text);
            letter-spacing: 0.05em;
            margin-bottom: 8px;
            display: block;
        }

        /* Items Table */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
        }

        .items-table th {
            background: var(--gray-light);
            color: var(--dark);
            text-transform: uppercase;
            font-size: 8pt;
            font-weight: 700;
            padding: 12px 15px;
            text-align: left;
        }

        .items-table td {
            padding: 15px;
            border-bottom: 1px solid var(--gray-light);
        }

        .item-description {
            font-weight: 600;
            display: block;
        }

        .text-right { text-align: right; }

        /* Summary Section */
        .summary-wrapper {
            margin-top: 30px;
            width: 100%;
        }

        .summary-table {
            width: 250px;
            margin-left: auto;
        }

        .summary-table td {
            padding: 8px 0;
        }

        .total-row {
            border-top: 2px solid var(--dark);
            font-weight: 800;
            font-size: 14pt;
        }

        .total-label {
            color: var(--primary);
        }

        .footer {
            margin-top: 60px;
            font-size: 8.5pt;
            color: var(--gray-text);
            border-top: 1px solid var(--gray-light);
            padding-top: 20px;
            text-align: center;
        }
    </style>
</head>
<body>
<div class="invoice-box">
    <!-- Header -->
    <table class="header-table">
        <tr>
            <td>
                <h2 class="brand-name">Your Company Name</h2>
                <div class="company-details">
                    Bucharest, Romania<br>
                    VAT: RO12345678 | Reg: J40/12345/2020<br>
                    hello@yourcompany.com
                </div>
            </td>
            <td class="text-right" style="vertical-align: top;">
                <h1 style="margin:0; font-weight: 300; font-size: 28pt;">INVOICE</h1>
                <span style="color: var(--gray-text)">#{{ $order->invoice_number }}</span><br>
                <strong>{{ $order->created_at->format('d M Y') }}</strong>
            </td>
        </tr>
    </table>

    <!-- Billing Info -->
    <table class="info-grid">
        <tr>
            <td style="width: 50%;">
                <span class="info-label">Bill To</span>
                @if($order->billing_company)
                    <strong>{{ $order->billing_company }}</strong><br>
                @endif
                {{ $order->billing_name }}<br>
                {{ $order->billing_address_1 }}<br>
                {{ $order->billing_city }}, {{ $order->billing_postal_code }}<br>
                {{ $order->billing_country }}
                @if($order->billing_vat_number)
                    <br><strong>VAT:</strong> {{ $order->billing_vat_number }}
                @endif
            </td>
            <td style="width: 50%; vertical-align: bottom;" class="text-right">
                <!-- Optional: Status Badge -->
                <span style="background: #dcfce7; color: #166534; padding: 5px 12px; border-radius: 20px; font-weight: 700; font-size: 9pt;">PAID</span>
            </td>
        </tr>
    </table>

    <!-- Items -->
    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 40%">Description</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">VAT</th>
                <th class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
            <tr>
                <td>
                    <span class="item-description">{{ $item->product->title ?? 'Digital Product' }}</span>
                </td>
                <td class="text-right">{{ $item->quantity }}</td>
                <td class="text-right">${{ number_format($item->price, 2) }}</td>
                <td class="text-right">21%</td>
                <td class="text-right"><strong>${{ number_format($item->price * $item->quantity, 2) }}</strong></td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Totals -->
    <div class="summary-wrapper">
        <table class="summary-table">
            <tr>
                <td>Subtotal</td>
                <td class="text-right">${{ number_format($order->subtotal, 2) }}</td>
            </tr>
            <tr>
                <td>VAT (21%)</td>
                <td class="text-right">${{ number_format($order->vat, 2) }}</td>
            </tr>
            <tr class="total-row">
                <td class="total-label">Total</td>
                <td class="text-right">${{ number_format($order->total, 2) }}</td>
            </tr>
        </table>
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>This invoice is issued in accordance with EU VAT Directive 2006/112/EC. Payment processed via Stripe.</p>
        <p><strong>Thank you for your business!</strong></p>
    </div>
</div>
</body>
</html>
