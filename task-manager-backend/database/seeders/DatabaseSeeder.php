<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::firstOrCreate([
            'name' => 'admin',
            'guard_name' => 'web',
        ]);

        $employeeRole = Role::firstOrCreate([
            'name' => 'employee',
            'guard_name' => 'web',
        ]);

        $admin = User::firstOrCreate(
            ['email' => 'admin@test.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password123'),
            ]
        );

        $admin->assignRole($adminRole);

        $employeeOne = User::firstOrCreate(
            ['email' => 'employee@test.com'],
            [
                'name' => 'Employee One',
                'password' => Hash::make('password123'),
            ]
        );

        $employeeOne->assignRole($employeeRole);

        $employeeTwo = User::firstOrCreate(
            ['email' => 'employee2@test.com'],
            [
                'name' => 'Employee Two',
                'password' => Hash::make('password123'),
            ]
        );

        $employeeTwo->assignRole($employeeRole);
    }
}