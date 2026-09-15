<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Advertisement extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'placement',
        'type',
        'image_url',
        'target_url',
        'script_code',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
