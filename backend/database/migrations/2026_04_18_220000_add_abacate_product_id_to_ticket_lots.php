<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ticket_lots', function (Blueprint $table) {
            $table->string('abacate_product_id')->nullable()->unique()->after('is_half_price');
        });
    }

    public function down(): void
    {
        Schema::table('ticket_lots', function (Blueprint $table) {
            $table->dropUnique(['abacate_product_id']);
            $table->dropColumn('abacate_product_id');
        });
    }
};
