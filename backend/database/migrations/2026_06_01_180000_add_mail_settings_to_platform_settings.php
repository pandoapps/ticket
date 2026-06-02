<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('platform_settings', function (Blueprint $table) {
            $table->string('mailgun_domain')->nullable()->after('stripe_secret_key');
            $table->text('mailgun_secret')->nullable()->after('mailgun_domain');
            $table->string('mailgun_endpoint', 100)->nullable()->default('api.mailgun.net')->after('mailgun_secret');
            $table->string('mail_from_address')->nullable()->after('mailgun_endpoint');
            $table->string('mail_from_name')->nullable()->after('mail_from_address');
        });
    }

    public function down(): void
    {
        Schema::table('platform_settings', function (Blueprint $table) {
            $table->dropColumn(['mailgun_domain', 'mailgun_secret', 'mailgun_endpoint', 'mail_from_address', 'mail_from_name']);
        });
    }
};
