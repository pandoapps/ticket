<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('platform_settings', function (Blueprint $table) {
            $table->decimal('pix_commission_percent', 5, 2)->default(0)->after('fixed_fee_cents');
            $table->decimal('pix_fixed_fee_cents', 10, 2)->default(0)->after('pix_commission_percent');
            $table->decimal('card_commission_percent', 5, 2)->default(0)->after('pix_fixed_fee_cents');
            $table->decimal('card_fixed_fee_cents', 10, 2)->default(0)->after('card_commission_percent');
        });

        DB::table('platform_settings')->get()->each(function ($row) {
            DB::table('platform_settings')->where('id', $row->id)->update([
                'pix_commission_percent' => $row->commission_percent,
                'pix_fixed_fee_cents' => $row->fixed_fee_cents,
                'card_commission_percent' => $row->commission_percent,
                'card_fixed_fee_cents' => $row->fixed_fee_cents,
            ]);
        });

        Schema::table('platform_settings', function (Blueprint $table) {
            $table->dropColumn(['commission_percent', 'fixed_fee_cents']);
        });
    }

    public function down(): void
    {
        Schema::table('platform_settings', function (Blueprint $table) {
            $table->decimal('commission_percent', 5, 2)->default(10)->after('id');
            $table->decimal('fixed_fee_cents', 10, 2)->default(0)->after('commission_percent');
        });

        DB::table('platform_settings')->get()->each(function ($row) {
            DB::table('platform_settings')->where('id', $row->id)->update([
                'commission_percent' => $row->pix_commission_percent,
                'fixed_fee_cents' => $row->pix_fixed_fee_cents,
            ]);
        });

        Schema::table('platform_settings', function (Blueprint $table) {
            $table->dropColumn([
                'pix_commission_percent',
                'pix_fixed_fee_cents',
                'card_commission_percent',
                'card_fixed_fee_cents',
            ]);
        });
    }
};
