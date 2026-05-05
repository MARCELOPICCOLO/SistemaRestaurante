<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'restaurant_id',
        'category_id',
        'name',
        'product_code',  // NOVO: código do produto
        'description',
        'price',
        'active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'active' => 'boolean'
    ];

    // Relacionamento com categoria
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Relacionamento com restaurante
    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    // Escopo para produtos ativos
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    // Escopo para buscar por código (único por restaurante)
    public function scopeByCode($query, $restaurantId, $code)
    {
        return $query->where('restaurant_id', $restaurantId)
            ->where('product_code', $code);
    }

    // Escopo para buscar por nome ou código
    public function scopeSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'LIKE', "%{$term}%")
                ->orWhere('product_code', 'LIKE', "%{$term}%");
        });
    }
}
