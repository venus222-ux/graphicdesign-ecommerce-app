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
        'preview_image',
        'asset_type',
        'is_published',
        'category_id',
        'user_id'
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
        $this
            ->addMediaCollection('preview')
            ->singleFile();

        $this
            ->addMediaCollection('asset');
    }

    public function getPreviewUrlAttribute()
    {
       return $this->getFirstMediaUrl('preview');
    }

    public function getAssetUrlAttribute()
    {
        return $this->getFirstMediaUrl('asset');
    }

    protected $casts = [
       'is_published' => 'boolean',
    ];


}
