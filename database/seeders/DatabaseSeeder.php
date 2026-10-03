<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed a demo UNEP training hotel with staff logins, guests, bookings, stock and work orders.
     *
     * Every staff account uses the password "password" (see StaffAccountSeeder::ACCOUNTS).
     */
    public function run(): void
    {
        fake()->seed(20261003);

        $this->call([
            StaffAccountSeeder::class,
            EmployeeSeeder::class,
            RoomSeeder::class,
            ReservationSeeder::class,
            InventorySeeder::class,
            MaintenanceSeeder::class,
        ]);
    }
}
