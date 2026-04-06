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
        $this->addMediaCollection('previews')
             ->useDisk('public')           // or 's3' etc.
             ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
             ->singleFile(false);          // allow multiple
    }

// Return first preview image
public function getPreviewUrlAttribute(): ?string
{
    $media = $this->getMedia('previews')->first();
    return $media ? asset('storage/' . $media->id . '/' . $media->file_name) : null;
}

// Return all preview images
public function getPreviewUrlsAttribute(): array
{
    return $this->getMedia('previews')
                ->map(fn($m) => asset('storage/' . $m->id . '/' . $m->file_name))
                ->toArray();
}
    protected $casts = [
       'is_published' => 'boolean',
    ];


}


/**
 * preview_url → prima imagine (pentru compatibilitate cu vechiul cod).
*preview_urls → array cu toate imaginile, pentru slider și shop page.
 */
