<?php

use App\Enums\ReservationStatus;
use App\Models\Employee;
use App\Models\Guest;
use App\Models\InventoryItem;
use App\Models\MaintenanceRequest;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Inertia\Testing\AssertableInertia as Assert;

it('renders every staff page for an administrator on the demo hotel', function () {
    $this->seed(DatabaseSeeder::class);
    $admin = User::query()->where('email', 'admin@hotel.test')->sole();
    $checkedOut = Reservation::query()->where('status', ReservationStatus::CheckedOut)->firstOrFail();
    $upcoming = Reservation::query()->where('status', ReservationStatus::Confirmed)->firstOrFail();

    $pages = [
        ['admin.dashboard', [], 'admin/dashboard'],
        ['admin.reservations.index', [], 'admin/reservations/index'],
        ['admin.reservations.create', [], 'admin/reservations/create'],
        ['admin.reservations.show', [$checkedOut], 'admin/reservations/show'],
        ['admin.reservations.show', [$upcoming], 'admin/reservations/show'],
        ['admin.reservations.edit', [$upcoming], 'admin/reservations/edit'],
        ['admin.guests.index', [], 'admin/guests/index'],
        ['admin.guests.show', [Guest::query()->firstOrFail()], 'admin/guests/show'],
        ['admin.rooms.index', [], 'admin/rooms/index'],
        ['admin.rooms.edit', [Room::query()->firstOrFail()], 'admin/rooms/form'],
        ['admin.room-types.index', [], 'admin/room-types/index'],
        ['admin.inventory-items.index', [], 'admin/inventory-items/index'],
        ['admin.inventory-items.show', [InventoryItem::query()->firstOrFail()], 'admin/inventory-items/show'],
        ['admin.inventory-categories.index', [], 'admin/inventory-categories/index'],
        ['admin.maintenance-requests.index', [], 'admin/maintenance-requests/index'],
        ['admin.maintenance-requests.show', [MaintenanceRequest::query()->firstOrFail()], 'admin/maintenance-requests/show'],
        ['admin.maintenance-requests.create', [], 'admin/maintenance-requests/form'],
        ['admin.employees.index', [], 'admin/employees/index'],
        ['admin.employees.show', [Employee::query()->firstOrFail()], 'admin/employees/show'],
        ['admin.employees.edit', [Employee::query()->firstOrFail()], 'admin/employees/form'],
        ['admin.departments.index', [], 'admin/departments/index'],
        ['admin.shifts.index', [], 'admin/shifts/index'],
        ['admin.users.index', [], 'admin/users/index'],
    ];

    foreach ($pages as [$routeName, $parameters, $component]) {
        $this->actingAs($admin)
            ->get(route($routeName, $parameters))
            ->assertInertia(fn (Assert $page) => $page->component($component));
    }
});

it('renders the public site pages', function () {
    $this->seed(DatabaseSeeder::class);

    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page->component('public/home')
        ->has('roomTypes', 4)
        ->where('hotel.school', 'University of Northeastern Philippines')
        ->where('hotel.department', 'Department of Hospitality & Tourism Management'));
    $this->get(route('booking.index'))->assertInertia(fn (Assert $page) => $page->component('public/booking/search'));
    $this->get(route('login'))->assertInertia(fn (Assert $page) => $page->component('auth/login'));
});
