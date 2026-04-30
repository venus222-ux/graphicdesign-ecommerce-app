PAYMENT FLOW:
User pays → Stripe
↓
Webhook fires
↓
Order → status = paid
↓
SendInvoiceJob dispatched
↓
Queue worker runs
↓
PDF generated
↓
Email sent with attachment

AUTH FLOW:
