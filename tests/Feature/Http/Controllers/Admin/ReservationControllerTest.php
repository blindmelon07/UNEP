<?php

use App\Enums\ReservationSource;
use App\Enums\ReservationStatus;
use App\Enums\Role;
use App\Models\Guest;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->travelTo('2026-10-03 09:00:00');
    $this->frontDesk = User::factory()->role(Role::FrontDesk)->create();
});

describe('store', function () {
    it('books a walk-in for a new guest as confirmed', function () {
        $roomType = RoomType::factory()->create(['base_rate' => 2500, 'capacity' => 2]);
        Room::factory()->for($roomType)->create();

        $response = $this->actingAs($this->frontDesk)->post(route('admin.reservations.store'), [
            'room_type_id' => $roomType->id,
            'check_in' => '2026-10-03',
            'check_out' => '2026-10-05',
            'adults' => 1,
            'source' => 'walk_in',
            'guest' => ['first_name' => 'Juan', 'last_name' => 'Cruz', 'email' => 'juan@example.com', 'phone' => '09170000000'],
        ]);

        $reservation = Reservation::sole();
        $response->assertRedirect(route('admin.reservations.show', $reservation));
        expect($reservation)
            ->status->toBe(ReservationStatus::Confirmed)
            ->source->toBe(ReservationSource::WalkIn)
            ->room_total->toBe('5000.00')
            ->and($reservation->guest->full_name)->toBe('Juan Cruz');
    });

    it('books an existing guest without creating a duplicate profile', function () {
        $guest = Guest::factory()->create();
        $roomType = RoomType::factory()->create();
        Room::factory()->for($roomType)->create();

        $this->actingAs($this->frontDesk)->post(route('admin.reservations.store'), [
            'guest_id' => $guest->id,
            'room_type_id' => $roomType->id,
            'check_in' => '2026-10-04',
            'check_out' => '2026-10-05',
            'adults' => 1,
            'source' => 'phone',
        ])->assertSessionHasNoErrors();

        expect(Guest::count())->toBe(1)
            ->and(Reservation::sole()->guest_id)->toBe($guest->id);
    });

    it('requires guest details when no existing guest is chosen', function () {
        $roomType = RoomType::factory()->create();

        $response = $this->actingAs($this->frontDesk)->post(route('admin.reservations.store'), [
            'room_type_id' => $roomType->id,
            'check_in' => '2026-10-04',
            'check_out' => '2026-10-05',
            'adults' => 1,
            'source' => 'walk_in',
        ]);

        $response->assertSessionHasErrors(['guest.first_name', 'guest.last_name', 'guest.email', 'guest.phone']);
        expect(Reservation::count())->toBe(0);
    });
});

describe('room assignment', function () {
    it('assigns a free room and confirms a pending online booking', function () {
        $room = Room::factory()->create();
        $reservation = Reservation::factory()->status(ReservationStatus::Pending)->create(['room_type_id' => $room->room_type_id]);

        $this->actingAs($this->frontDesk)
            ->put(route('admin.reservations.room.update', $reservation), ['room_id' => $room->id])
            ->assertInertiaFlash('success', 'Room assigned.');

        expect($reservation->refresh())
            ->room_id->toBe($room->id)
            ->status->toBe(ReservationStatus::Confirmed);
    });

    it('refuses a room already booked for overlapping dates', function () {
        $room = Room::factory()->create();
        Reservation::factory()->forRoom($room)->between('2026-10-05', '2026-10-08')->create();
        $reservation = Reservation::factory()->between('2026-10-07', '2026-10-09')->create(['room_type_id' => $room->room_type_id]);

        $response = $this->actingAs($this->frontDesk)->put(route('admin.reservations.room.update', $reservation), ['room_id' => $room->id]);

        $response->assertSessionHasErrors(['room_id' => 'That room is not free for this stay.']);
        expect($reservation->refresh()->room_id)->toBeNull();
    });

    it('refuses a room of a different room type', function () {
        $otherRoom = Room::factory()->create();
        $reservation = Reservation::factory()->create();

        $response = $this->actingAs($this->frontDesk)->put(route('admin.reservations.room.update', $reservation), ['room_id' => $otherRoom->id]);

        $response->assertSessionHasErrors('room_id');
    });
});

describe('update', function () {
    it('reprices the stay when the dates change', function () {
        $room = Room::factory()->create();
        $reservation = Reservation::factory()->forRoom($room)->between('2026-10-05', '2026-10-06')->create(['nightly_rate' => 3000]);

        $this->actingAs($this->frontDesk)->put(route('admin.reservations.update', $reservation), [
            'room_type_id' => $room->room_type_id,
            'room_id' => $room->id,
            'check_in' => '2026-10-05',
            'check_out' => '2026-10-08',
            'adults' => 2,
        ])->assertRedirect(route('admin.reservations.show', $reservation));

        expect($reservation->refresh())
            ->check_out->toDateString()->toBe('2026-10-08')
            ->room_total->toBe('9000.00');
    });

    it('refuses to edit a reservation that is already checked in', function () {
        $reservation = Reservation::factory()->status(ReservationStatus::CheckedIn)->create();

        $response = $this->actingAs($this->frontDesk)->get(route('admin.reservations.edit', $reservation));

        $response->assertRedirect(route('admin.reservations.show', $reservation))
            ->assertInertiaFlash('error', 'Only pending or confirmed reservations can be edited.');
    });
});

it('shows the folio with the balance after charges and payments', function () {
    $reservation = Reservation::factory()->create(['room_total' => 5000]);
    $reservation->charges()->create(['description' => 'Minibar', 'amount' => 450]);
    $reservation->payments()->create(['amount' => 2000, 'method' => 'cash', 'paid_at' => now()]);

    $response = $this->actingAs($this->frontDesk)->get(route('admin.reservations.show', $reservation));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/reservations/show')
        ->where('folio.grand_total', 5450)
        ->where('folio.paid', 2000)
        ->where('folio.balance', 3450));
});

it('cancels a confirmed reservation', function () {
    $reservation = Reservation::factory()->create();

    $this->actingAs($this->frontDesk)->post(route('admin.reservations.cancellation.store', $reservation));

    expect($reservation->refresh()->status)->toBe(ReservationStatus::Cancelled);
});

it('records a payment received by the signed-in clerk', function () {
    $reservation = Reservation::factory()->create();

    $this->actingAs($this->frontDesk)->post(route('admin.reservations.payments.store', $reservation), [
        'amount' => 1500,
        'method' => 'gcash',
        'reference' => 'GC-123',
    ]);

    $this->assertDatabaseHas('payments', [
        'reservation_id' => $reservation->id,
        'amount' => 1500,
        'method' => 'gcash',
        'received_by' => $this->frontDesk->id,
    ]);
});
