<?php
// app/Models/Expense.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $fillable = [
        'restaurant_id',
        'description',
        'amount',
        'expense_date',
        'category',
        'notes'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expense_date' => 'date'
    ];

    // Constantes para categorias
    const CATEGORIES = [
        'carnes' => '🥩 Carnes',
        'mercado' => '🛒 Mercado',
        'agua' => '💧 Água',
        'luz' => '⚡ Luz',
        'gas' => '🔥 Gás',
        'bebidas' => '🍺 Bebidas',
        'embalagens' => '📦 Embalagens',
        'outros' => '📌 Outros'
    ];

    // Relacionamento com restaurante
    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    // Escopos
    public function scopeByDate($query, $date)
    {
        return $query->whereDate('expense_date', $date);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByPeriod($query, $startDate, $endDate)
    {
        return $query->whereBetween('expense_date', [$startDate, $endDate]);
    }

    // Accessor para categoria formatada
    public function getCategoryLabelAttribute()
    {
        return self::CATEGORIES[$this->category] ?? $this->category;
    }

    // Accessor para valor formatado
    public function getFormattedAmountAttribute()
    {
        return 'R$ ' . number_format($this->amount, 2, ',', '.');
    }
}
