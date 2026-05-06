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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('table_id')->constrained()->cascadeOnDelete();
            $table->string('customer_name', 100)->nullable(); // Nome do cliente

            // ✅ VARCHAR em vez de ENUM (mais flexível)
            $table->string('status', 50)->default('aberto');

            $table->decimal('total', 10, 2)->default(0);

            // ✅ VARCHAR para forma de pagamento
            $table->string('payment_method', 50)->nullable();

            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            // Índices para otimizar consultas
            $table->index(['restaurant_id', 'status']);
            $table->index(['table_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
