<?php

use App\Enums\Role;
use App\Models\User;

dataset('module pages', [
    'reservations' => ['admin.reservations.index', 'reservations'],
    'inventory' => ['admin.inventory-items.index', 'inventory'],
    'maintenance' => ['admin.maintenance-requests.index', 'maintenance'],
    'employees' => ['admin.employees.index', 'employees'],
    'staff accounts' => ['admin.users.index', 'users'],
]);

it('lets each role open only the modules it is granted', function (Role $role, string $routeName, string $module) {
    $user = User::factory()->role($role)->create();

    $response = $this->actingAs($user)->get(route($routeName));

    in_array($module, $role->modules(), true)
        ? $response->assertOk()
        : $response->assertForbidden();
})->with(Role::cases())->with('module pages');

test('the role module grants match the hotel org chart', function () {
    expect(Role::Admin->modules())->toBe(['reservations', 'inventory', 'maintenance', 'employees', 'users'])
        ->and(Role::FrontDesk->modules())->toBe(['reservations'])
        ->and(Role::Maintenance->modules())->toBe(['maintenance'])
        ->and(Role::Inventory->modules())->toBe(['inventory'])
        ->and(Role::HumanResources->modules())->toBe(['employees']);
});

it('lets maintenance staff open the room board but not edit rooms', function () {
    $user = User::factory()->role(Role::Maintenance)->create();

    $this->actingAs($user)->get(route('admin.rooms.index'))->assertOk();
    $this->actingAs($user)->get(route('admin.rooms.create'))->assertForbidden();
});
