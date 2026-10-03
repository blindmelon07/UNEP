<?php

use App\Enums\ReservationStatus;
use App\Enums\Role;
use App\Enums\RoomStatus;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;

beforeEach(function () {
    $this->frontDesk = User::factory()->role(Role::FrontDesk)->create();
    $this->room = Room::factory()->create(['status' => RoomStatus::Occupied]);
    $this->reservation = Reservation::factory()
        ->forRoom($this->room)
        ->status(ReservationStatus::CheckedIn)
        ->create(['room_total' => 4000]);
});

it('checks a settled guest out and sends the room to housekeeping', function () {
    $this->reservation->payments()->create(['amount' => 4000, 'method' => 'cash', 'paid_at' => now()]);

    $this->actingAs($this->frontDesk)->post(route('admin.reservations.check-out.store', $this->reservation));

    expect($this->reservation->refresh())
        ->status->toBe(ReservationStatus::CheckedOut)
        ->checked_out_at->not->toBeNull()
        ->and($this->room->refresh()->status)->toBe(RoomStatus::Cleaning);
});

it('refuses check-out while extra charges are unpaid', function () {
    $this->reservation->payments()->create(['amount' => 4000, 'method' => 'cash', 'paid_at' => now()]);
    $this->reservation->charges()->create(['description' => 'Laundry', 'amount' => 350]);

    $response = $this->actingAs($this->frontDesk)->post(route('admin.reservations.check-out.store', $this->reservation));

    $response->assertInertiaFlash('error', 'Settle the outstanding balance of ₱350.00 before check-out.');
    expect($this->reservation->refresh()->status)->toBe(ReservationStatus::CheckedIn)
        ->and($this->room->refresh()->status)->toBe(RoomStatus::Occupied);
});
