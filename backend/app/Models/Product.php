<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Product extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'title',
        'slug',
        'short_description',
        'description',
        'price',
        'asset_type',
        'is_published',
        'category_id',
        'user_id'
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

public function registerMediaCollections(): void
{
    $this->addMediaCollection('previews')
        ->useDisk('public')
        ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'])
        ->singleFile(false)           // ← Very important
        ->onlyKeepLatest(999);       // null = keep all files

    $this->addMediaCollection('asset')
        ->useDisk('public')
        ->singleFile(true);
}


    public function users()
    {
       return $this->belongsToMany(User::class);
    }

    public function wishedByUsers()
{
    return $this->belongsToMany(
        User::class,
        'wishlists'
    )->withTimestamps();
}
}
