<?php
// app/Models/Table.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Table extends Model
{
    protected $fillable = [
        'restaurant_id',
        'number',
        'qr_code_hash'  // ← ADICIONE ESTA LINHA
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
