<?php

use App\Enums\ReservationStatus;
use App\Enums\Role;
use App\Enums\RoomStatus;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;

beforeEach(function () {
    $this->travelTo('2026-10-03 14:00:00');
    $this->frontDesk = User::factory()->role(Role::FrontDesk)->create();
});

it('checks the guest in and marks the room occupied', function () {
    $room = Room::factory()->create();
    $reservation = Reservation::factory()->forRoom($room)->between('2026-10-03', '2026-10-05')->create();

    $this->actingAs($this->frontDesk)->post(route('admin.reservations.check-in.store', $reservation));

    expect($reservation->refresh())
        ->status->toBe(ReservationStatus::CheckedIn)
        ->checked_in_at->toDateTimeString()->toBe('2026-10-03 14:00:00')
        ->and($room->refresh()->status)->toBe(RoomStatus::Occupied);
});

it('refuses check-in when the room is not ready', function (RoomStatus $status) {
    $room = Room::factory()->create(['status' => $status]);
    $reservation = Reservation::factory()->forRoom($room)->between('2026-10-03', '2026-10-05')->create();

    $response = $this->actingAs($this->frontDesk)->post(route('admin.reservations.check-in.store', $reservation));

    $response->assertInertiaFlash('error', "Room {$room->number} is not ready ({$status->label()}).");
    expect($reservation->refresh()->status)->toBe(ReservationStatus::Confirmed);
})->with([RoomStatus::Cleaning, RoomStatus::Maintenance]);

it('refuses check-in before a room is assigned', function () {
    $reservation = Reservation::factory()->between('2026-10-03', '2026-10-05')->create();

    $response = $this->actingAs($this->frontDesk)->post(route('admin.reservations.check-in.store', $reservation));

    $response->assertInertiaFlash('error', 'Assign a room before checking the guest in.');
    expect($reservation->refresh()->status)->toBe(ReservationStatus::Confirmed);
});

it('refuses check-in before the arrival date', function () {
    $room = Room::factory()->create();
    $reservation = Reservation::factory()->forRoom($room)->between('2026-10-04', '2026-10-05')->create();

    $response = $this->actingAs($this->frontDesk)->post(route('admin.reservations.check-in.store', $reservation));

    $response->assertInertiaFlash('error', 'This reservation starts on Oct 4, 2026.');
    expect($room->refresh()->status)->toBe(RoomStatus::Available);
});
