<?php
// database/migrations/xxxx_xx_xx_xxxxxx_add_unique_constraint_to_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('tables', function (Blueprint $table) {
            // Adiciona constraint única para restaurant_id + number
            $table->unique(['restaurant_id', 'number'], 'unique_table_per_restaurant');
        });
    }

    public function down()
    {
        Schema::table('tables', function (Blueprint $table) {
            $table->dropUnique('unique_table_per_restaurant');
        });
    }
};
