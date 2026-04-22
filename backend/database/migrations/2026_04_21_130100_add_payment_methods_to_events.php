<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->boolean('accepts_pix')->default(true)->after('is_featured');
            $table->boolean('accepts_card')->default(true)->after('accepts_pix');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['accepts_pix', 'accepts_card']);
        });
    }
};
