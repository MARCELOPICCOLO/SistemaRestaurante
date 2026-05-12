<?php
// database/migrations/xxxx_xx_xx_xxxxxx_add_category_id_to_expenses_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Primeiro adiciona a coluna category_id
        Schema::table('expenses', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('category');
        });

        // Migrar dados existentes (se tiver)
        // Depois remove a coluna antiga category
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn('category_id');
            $table->enum('category', ['carnes', 'mercado', 'agua', 'luz', 'gas', 'bebidas', 'embalagens', 'outros'])->nullable();
        });
    }
};
