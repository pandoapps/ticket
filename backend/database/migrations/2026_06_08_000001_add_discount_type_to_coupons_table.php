<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->string('discount_type', 10)->default('percent')->after('discount_percent');
            $table->decimal('discount_fixed', 10, 2)->nullable()->after('discount_type');
            $table->decimal('discount_percent', 5, 2)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->dropColumn(['discount_type', 'discount_fixed']);
            $table->decimal('discount_percent', 5, 2)->nullable(false)->change();
        });
    }
};
