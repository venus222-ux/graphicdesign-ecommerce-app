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

    protected $appends = [
      'preview_url',
      'preview_urls'
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
         ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
         ->singleFile(false);

    // Optional: also register the asset collection explicitly
    $this->addMediaCollection('asset')
         ->useDisk('public')
         ->singleFile(true);   // usually only one asset file
}

  public function getPreviewUrlAttribute(): ?string  // first image
  {
    $media = $this->getMedia('previews')->first();
    return $media?->getFullUrl();   // use null-safe operator
  }

   public function getPreviewUrlsAttribute(): array // ALL images
   {
    return $this->getMedia('previews')
        ->map(fn($media) => $media->getFullUrl())
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
