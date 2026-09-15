<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChapterContent extends Model
{
    use HasFactory;

    protected $fillable = ['chapter_id', 'content'];

    public function chapter()
    {
        return $this->belongsTo(Chapter::class);
    }
}
