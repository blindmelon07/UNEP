<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class StaffAccountSeeder extends Seeder
{
    /**
     * Demo staff logins. Every account uses the password "password".
     *
     * @var list<array{0: string, 1: string, 2: Role, 3: bool}>
     */
    public const array ACCOUNTS = [
        ['Hotel Administrator', 'admin@hotel.test', Role::Admin, true],
        ['Marites Obias', 'frontdesk@hotel.test', Role::FrontDesk, true],
        ['Jerome Volante', 'nightaudit@hotel.test', Role::FrontDesk, true],
        ['Princess Sabater', 'trainee@hotel.test', Role::FrontDesk, true],
        ['Ramon Imperial', 'maintenance@hotel.test', Role::Maintenance, true],
        ['Liza Badiola', 'housekeeping@hotel.test', Role::Maintenance, true],
        ['Arnel Tria', 'inventory@hotel.test', Role::Inventory, true],
        ['Rowena Nacional', 'hr@hotel.test', Role::HumanResources, true],
        ['Former Clerk', 'inactive@hotel.test', Role::FrontDesk, false],
    ];

    /**
     * Create the demo staff accounts.
     */
    public function run(): void
    {
        foreach (self::ACCOUNTS as [$name, $email, $role, $isActive]) {
            User::factory()->create([
                'name' => $name,
                'email' => $email,
                'role' => $role,
                'is_active' => $isActive,
            ]);
        }
    }
}
