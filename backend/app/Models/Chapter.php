<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chapter extends Model
{
    use HasFactory;

    protected $fillable = [
        'story_id',
        'chapter_number',
        'title',
        'slug',
        'is_paid',
        'coin_price',
        'view_count',
        'status'
    ];

    protected $casts = [
        'is_paid' => 'boolean',
    ];

    public function story()
    {
        return $this->belongsTo(Story::class);
    }

    public function textContent()
    {
        return $this->hasOne(ChapterContent::class);
    }

    public function comicImages()
    {
        return $this->hasMany(ComicImage::class)->orderBy('order_index', 'asc');
    }

    public function unlocks()
    {
        return $this->hasMany(ChapterUnlock::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
