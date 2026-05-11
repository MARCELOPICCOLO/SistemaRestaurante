<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_expenses_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->string('description', 255);
            $table->decimal('amount', 10, 2);
            $table->date('expense_date');
            $table->enum('category', [
                'carnes',
                'mercado',
                'agua',
                'luz',
                'gas',
                'bebidas',
                'embalagens',
                'outros'
            ])->default('outros');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Índices para otimizar consultas
            $table->index(['restaurant_id', 'expense_date']);
            $table->index(['restaurant_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
