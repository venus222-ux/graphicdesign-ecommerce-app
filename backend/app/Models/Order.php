<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Order extends Model implements HasMedia
{

use InteractsWithMedia;


    protected $fillable = [
        'user_id',
        'total',
        'status',
        'stripe_session_id'
    ];

    protected static function boot()
{
    parent::boot();

    static::creating(function ($order) {
        $year = date('Y');

        $lastId = Order::whereYear('created_at', $year)->count() + 1;

        $order->invoice_number =
            'INV-' . $year . '-' . str_pad($lastId, 4, '0', STR_PAD_LEFT);
    });
}

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
