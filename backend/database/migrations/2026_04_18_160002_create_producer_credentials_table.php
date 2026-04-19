<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('producer_credentials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producer_id')->unique()->constrained()->onDelete('cascade');
            $table->text('public_key');
            $table->text('secret_key');
            $table->timestamp('validated_at')->nullable();
            $table->string('validation_error')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('producer_credentials');
    }
};
