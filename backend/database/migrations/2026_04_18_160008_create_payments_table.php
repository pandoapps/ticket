<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('gateway')->default('abacate_pay');
            $table->string('gateway_charge_id')->nullable()->index();
            $table->enum('status', ['pending', 'paid', 'cancelled', 'failed'])->default('pending')->index();
            $table->decimal('amount', 10, 2);
            $table->json('payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
