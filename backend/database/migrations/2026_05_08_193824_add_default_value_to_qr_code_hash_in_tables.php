<?php
// database/migrations/xxxx_xx_xx_xxxxxx_add_default_value_to_qr_code_hash_in_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('tables', function (Blueprint $table) {
            // Permitir NULL ou adicionar valor padrão
            $table->string('qr_code_hash')->nullable()->change();
            // OU
            // $table->string('qr_code_hash')->default('')->change();
        });
    }

    public function down()
    {
        Schema::table('tables', function (Blueprint $table) {
            $table->string('qr_code_hash')->nullable(false)->change();
        });
    }
};
