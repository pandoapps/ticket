<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\PlatformSetting;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        PlatformSetting::updateOrCreate(
            ['id' => 1],
            [
                'pix_commission_percent' => 10.00,
                'pix_fixed_fee_cents' => 0,
                'card_commission_percent' => 10.00,
                'card_fixed_fee_cents' => 0,
            ],
        );

        User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Admin',
                'password' => '123456',
                'role' => UserRole::Admin->value,
            ],
        );
    }
}
