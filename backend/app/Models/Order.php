<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'total',
        'status',
        'stripe_session_id'
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function invoice()
{
    return [
        'order_id' => $this->id,
        'date' => $this->created_at,
        'total' => $this->total,
        'items' => $this->items->map(fn ($i) => [
            'title' => $i->product->title,
            'price' => $i->price,
            'qty' => $i->quantity,
        ])
    ];
}
}
