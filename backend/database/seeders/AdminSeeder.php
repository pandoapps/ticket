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
            ['commission_percent' => 10.00, 'fixed_fee_cents' => 0],
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
