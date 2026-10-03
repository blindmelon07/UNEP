<?php

use App\Enums\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

it('creates a staff account with a role', function () {
    $this->actingAs($this->admin)->post(route('admin.users.store'), [
        'name' => 'New Clerk',
        'email' => 'clerk@hotel.test',
        'role' => 'front_desk',
        'is_active' => '1',
        'password' => 'secret-password',
        'password_confirmation' => 'secret-password',
    ])->assertRedirect(route('admin.users.index'));

    $user = User::query()->where('email', 'clerk@hotel.test')->sole();
    expect($user->role)->toBe(Role::FrontDesk)
        ->and(Hash::check('secret-password', $user->password))->toBeTrue();
});

it('keeps the current password when the field is left blank', function () {
    $user = User::factory()->create();
    $originalHash = $user->password;

    $this->actingAs($this->admin)->put(route('admin.users.update', $user), [
        'name' => 'Renamed',
        'email' => $user->email,
        'role' => 'inventory',
        'is_active' => '1',
        'password' => '',
        'password_confirmation' => '',
    ])->assertSessionHasNoErrors();

    expect($user->refresh())
        ->name->toBe('Renamed')
        ->role->toBe(Role::Inventory)
        ->password->toBe($originalHash);
});

it('stops an admin from removing their own admin access', function () {
    $response = $this->actingAs($this->admin)->put(route('admin.users.update', $this->admin), [
        'name' => $this->admin->name,
        'email' => $this->admin->email,
        'role' => 'front_desk',
        'is_active' => '1',
    ]);

    $response->assertSessionHasErrors(['role' => 'You cannot remove your own administrator access.']);
    expect($this->admin->refresh()->role)->toBe(Role::Admin);
});

it('stops an admin from deleting their own account', function () {
    $response = $this->actingAs($this->admin)->delete(route('admin.users.destroy', $this->admin));

    $response->assertInertiaFlash('error', 'You cannot delete your own account.');
    $this->assertModelExists($this->admin);
});
