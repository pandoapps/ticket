<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE payments MODIFY COLUMN status ENUM('pending', 'paid', 'cancelled', 'expired', 'failed') NOT NULL DEFAULT 'pending'");
    }

    public function down(): void
    {
        DB::statement("UPDATE payments SET status = 'cancelled' WHERE status = 'expired'");
        DB::statement("ALTER TABLE payments MODIFY COLUMN status ENUM('pending', 'paid', 'cancelled', 'failed') NOT NULL DEFAULT 'pending'");
    }
};
