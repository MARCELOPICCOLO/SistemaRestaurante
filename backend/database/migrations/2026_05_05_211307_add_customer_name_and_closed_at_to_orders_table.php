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
        Schema::table('orders', function (Blueprint $table) {
            // Adiciona a coluna customer_name depois da coluna table_id
            $table->string('customer_name')->nullable()->after('table_id');

            // Adiciona a coluna closed_at depois da coluna status
            $table->timestamp('closed_at')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Remove as colunas se a migration for revertida
            $table->dropColumn('customer_name');
            $table->dropColumn('closed_at');
        });
    }
};
