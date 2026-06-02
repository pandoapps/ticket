<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('platform_settings', function (Blueprint $table) {
            $table->string('active_gateway')->default('abacate_pay')->after('card_fixed_fee_cents');
            $table->string('abacatepay_public_key')->nullable()->after('active_gateway');
            $table->text('abacatepay_secret_key')->nullable()->after('abacatepay_public_key');
            $table->string('stripe_public_key')->nullable()->after('abacatepay_secret_key');
            $table->text('stripe_secret_key')->nullable()->after('stripe_public_key');
        });
    }

    public function down(): void
    {
        Schema::table('platform_settings', function (Blueprint $table) {
            $table->dropColumn(['active_gateway', 'abacatepay_public_key', 'abacatepay_secret_key', 'stripe_public_key', 'stripe_secret_key']);
        });
    }
};
