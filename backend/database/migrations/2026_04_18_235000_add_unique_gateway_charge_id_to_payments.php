<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['gateway_charge_id']);
            $table->unique(['gateway', 'gateway_charge_id'], 'payments_gateway_charge_unique');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropUnique('payments_gateway_charge_unique');
            $table->index('gateway_charge_id');
        });
    }
};
