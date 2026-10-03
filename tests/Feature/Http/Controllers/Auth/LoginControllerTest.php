<?php

use App\Models\User;

it('signs in an active staff member and redirects to the dashboard', function () {
    $user = User::factory()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('admin.dashboard'));
    $this->assertAuthenticatedAs($user);
});

it('rejects a wrong password', function () {
    $user = User::factory()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertSessionHasErrors(['email' => 'These credentials do not match our records.']);
    $this->assertGuest();
});

it('rejects a deactivated account even with the right password', function () {
    $user = User::factory()->create(['is_active' => false]);

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

it('logs out a staff member whose account was deactivated mid-session', function () {
    $user = User::factory()->admin()->create(['is_active' => false]);

    $response = $this->actingAs($user)->get(route('admin.dashboard'));

    $response->assertRedirect(route('login'));
    $this->assertGuest();
});

it('redirects guests from the staff portal to the login page', function () {
    $response = $this->get(route('admin.dashboard'));

    $response->assertRedirect(route('login'));
});

it('logs the user out', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'));

    $response->assertRedirect(route('login'));
    $this->assertGuest();
});
