<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Adiciona coluna product_code após o name
            $table->string('product_code', 50)->nullable()->after('name');

            // Índice único composto: restaurant_id + product_code
            // Isso garante que o código seja único apenas dentro do mesmo restaurante
            $table->unique(['restaurant_id', 'product_code'], 'unique_product_code_per_restaurant');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Remove o índice único primeiro
            $table->dropUnique('unique_product_code_per_restaurant');

            // Depois remove a coluna
            $table->dropColumn('product_code');
        });
    }
};
