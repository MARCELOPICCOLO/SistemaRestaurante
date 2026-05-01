<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'restaurant_id',
        'category_id',
        'name',
        'description',
        'price',
        'active'
    ];

    public function category()
    {
        return $this->belongsTo(\App\Models\Category::class);
    }
}
