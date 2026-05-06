<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Refund extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = [
        'order_id',
        'amount',
        'reason',
        'stripe_refund_id',
        'credit_note_number'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
