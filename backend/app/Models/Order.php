<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'restaurant_id',
        'table_name',
        'status',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
