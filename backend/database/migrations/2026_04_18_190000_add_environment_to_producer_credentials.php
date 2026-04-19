<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('producer_credentials', function (Blueprint $table) {
            $table->enum('environment', ['sandbox', 'production'])
                ->default('sandbox')
                ->after('secret_key')
                ->index();
        });
    }

    public function down(): void
    {
        Schema::table('producer_credentials', function (Blueprint $table) {
            $table->dropIndex(['environment']);
            $table->dropColumn('environment');
        });
    }
};
