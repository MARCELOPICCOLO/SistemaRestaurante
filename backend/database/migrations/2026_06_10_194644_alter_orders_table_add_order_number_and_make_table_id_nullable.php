<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // PRIMEIRO: Adicionar a coluna order_number
        Schema::table('orders', function (Blueprint $table) {
            $table->string('order_number', 20)->nullable()->after('id');
        });

        // SEGUNDO: Preencher os order_number para registros existentes (usando DB raw)
        $orders = DB::table('orders')->whereNull('order_number')->get();

        foreach ($orders as $order) {
            $prefix = date('ymd', strtotime($order->created_at ?? 'now'));

            $lastOrder = DB::table('orders')
                ->where('order_number', 'LIKE', "{$prefix}%")
                ->orderBy('order_number', 'desc')
                ->first();

            if ($lastOrder && $lastOrder->order_number) {
                $lastNumber = intval(substr($lastOrder->order_number, -4));
                $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
            } else {
                $newNumber = '0001';
            }

            $orderNumber = "{$prefix}{$newNumber}";

            // Garantir unicidade
            $counter = 1;
            while (DB::table('orders')->where('order_number', $orderNumber)->exists()) {
                $orderNumber = "{$prefix}" . str_pad($newNumber + $counter, 4, '0', STR_PAD_LEFT);
                $counter++;
            }

            DB::table('orders')
                ->where('id', $order->id)
                ->update(['order_number' => $orderNumber]);
        }

        // TERCEIRO: Alterar colunas
        Schema::table('orders', function (Blueprint $table) {
            // Tornar order_number NOT NULL após preencher
            $table->string('order_number', 20)->nullable(false)->change();

            // Tornar table_id opcional
            $table->unsignedBigInteger('table_id')->nullable()->change();

            // Tornar customer_name opcional
            $table->string('customer_name', 100)->nullable()->change();
        });

        // QUARTO: Adicionar índice único
        Schema::table('orders', function (Blueprint $table) {
            $table->unique(['restaurant_id', 'order_number'], 'unique_order_number_per_restaurant');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Remover índice único
            $table->dropUnique('unique_order_number_per_restaurant');

            // Remover coluna order_number
            $table->dropColumn('order_number');

            // Reverter table_id para NOT NULL
            $table->unsignedBigInteger('table_id')->nullable(false)->change();

            // Reverter customer_name para NOT NULL
            $table->string('customer_name', 100)->nullable(false)->change();
        });
    }
};
