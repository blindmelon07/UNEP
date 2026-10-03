<?php

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Inertia\Testing\AssertableInertia as Assert;

it('renders every staff page for an administrator on the demo hotel', function (string $routeName, string $component, array $parameters) {
    $this->seed(DatabaseSeeder::class);
    $admin = User::query()->where('email', 'admin@hotel.test')->sole();

    $response = $this->actingAs($admin)->get(route($routeName, $parameters));

    $response->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    'dashboard' => ['admin.dashboard', 'admin/dashboard', []],
    'reservations' => ['admin.reservations.index', 'admin/reservations/index', []],
    'new reservation' => ['admin.reservations.create', 'admin/reservations/create', []],
    'reservation' => ['admin.reservations.show', 'admin/reservations/show', ['reservation' => 1]],
    'edit reservation' => ['admin.reservations.edit', 'admin/reservations/edit', ['reservation' => 5]],
    'guests' => ['admin.guests.index', 'admin/guests/index', []],
    'guest' => ['admin.guests.show', 'admin/guests/show', ['guest' => 1]],
    'rooms' => ['admin.rooms.index', 'admin/rooms/index', []],
    'edit room' => ['admin.rooms.edit', 'admin/rooms/form', ['room' => 1]],
    'room types' => ['admin.room-types.index', 'admin/room-types/index', []],
    'stock items' => ['admin.inventory-items.index', 'admin/inventory-items/index', []],
    'stock item' => ['admin.inventory-items.show', 'admin/inventory-items/show', ['inventory_item' => 1]],
    'inventory categories' => ['admin.inventory-categories.index', 'admin/inventory-categories/index', []],
    'work orders' => ['admin.maintenance-requests.index', 'admin/maintenance-requests/index', []],
    'work order' => ['admin.maintenance-requests.show', 'admin/maintenance-requests/show', ['maintenance_request' => 1]],
    'new work order' => ['admin.maintenance-requests.create', 'admin/maintenance-requests/form', []],
    'employees' => ['admin.employees.index', 'admin/employees/index', []],
    'employee' => ['admin.employees.show', 'admin/employees/show', ['employee' => 1]],
    'edit employee' => ['admin.employees.edit', 'admin/employees/form', ['employee' => 1]],
    'departments' => ['admin.departments.index', 'admin/departments/index', []],
    'shift roster' => ['admin.shifts.index', 'admin/shifts/index', []],
    'staff accounts' => ['admin.users.index', 'admin/users/index', []],
]);

it('renders the public site pages', function () {
    $this->seed(DatabaseSeeder::class);

    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page->component('public/home')->has('roomTypes', 4));
    $this->get(route('booking.index'))->assertInertia(fn (Assert $page) => $page->component('public/booking/search'));
    $this->get(route('login'))->assertInertia(fn (Assert $page) => $page->component('auth/login'));
});
