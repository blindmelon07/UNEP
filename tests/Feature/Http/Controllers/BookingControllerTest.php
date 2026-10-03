<?php

use App\Enums\ReservationSource;
use App\Enums\ReservationStatus;
use App\Enums\RoomStatus;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomType;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->travelTo('2026-10-03 09:00:00');
});

/**
 * @return array<string, mixed>
 */
function bookingPayload(array $overrides = []): array
{
    return [
        'check_in' => '2026-10-10',
        'check_out' => '2026-10-13',
        'adults' => 2,
        'children' => 0,
        'first_name' => 'Maria',
        'last_name' => 'Santos',
        'email' => 'maria@example.com',
        'phone' => '09171234567',
        ...$overrides,
    ];
}

it('lists only room types with a free room for the requested stay', function () {
    $deluxe = RoomType::factory()->create(['name' => 'Deluxe', 'capacity' => 2]);
    $suite = RoomType::factory()->create(['name' => 'Suite', 'capacity' => 2]);
    $bookedRoom = Room::factory()->for($suite)->create();
    Room::factory()->for($deluxe)->create();
    Reservation::factory()->forRoom($bookedRoom)->between('2026-10-09', '2026-10-11')->create();

    $response = $this->get(route('booking.index', ['check_in' => '2026-10-10', 'check_out' => '2026-10-12', 'guests' => 2]));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('public/booking/search')
        ->has('roomTypes', 1)
        ->where('roomTypes.0.name', 'Deluxe')
        ->where('roomTypes.0.available_rooms', 1));
});

it('hides room types too small for the party', function () {
    $roomType = RoomType::factory()->create(['capacity' => 2]);
    Room::factory()->for($roomType)->create();

    $response = $this->get(route('booking.index', ['check_in' => '2026-10-10', 'check_out' => '2026-10-12', 'guests' => 3]));

    $response->assertInertia(fn (Assert $page) => $page->has('roomTypes', 0));
});

it('does not sell rooms that are out of service', function () {
    $roomType = RoomType::factory()->create();
    Room::factory()->for($roomType)->create(['status' => RoomStatus::OutOfService]);

    $response = $this->get(route('booking.index', ['check_in' => '2026-10-10', 'check_out' => '2026-10-12', 'guests' => 1]));

    $response->assertInertia(fn (Assert $page) => $page->has('roomTypes', 0));
});

it('creates a pending online reservation priced at the nightly rate', function () {
    $roomType = RoomType::factory()->create(['base_rate' => 3500, 'capacity' => 2]);
    Room::factory()->for($roomType)->create();

    $response = $this->post(route('booking.store', $roomType), bookingPayload());

    $reservation = Reservation::sole();
    $response->assertRedirect(route('booking.show', $reservation->code));
    expect($reservation)
        ->status->toBe(ReservationStatus::Pending)
        ->source->toBe(ReservationSource::Online)
        ->room_id->toBeNull()
        ->room_total->toBe('10500.00')
        ->and($reservation->guest->email)->toBe('maria@example.com');
});

it('rejects a booking when every room of the type is taken', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create();
    Reservation::factory()->forRoom($room)->between('2026-10-12', '2026-10-15')->create();

    $response = $this->post(route('booking.store', $roomType), bookingPayload());

    $response->assertSessionHasErrors(['room_type_id' => "No {$roomType->name} is available for the selected dates."]);
    expect(Reservation::count())->toBe(1);
});

it('allows a new stay to start on the day another guest checks out', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create();
    Reservation::factory()->forRoom($room)->between('2026-10-07', '2026-10-10')->create();

    $response = $this->post(route('booking.store', $roomType), bookingPayload());

    $response->assertSessionHasNoErrors();
    expect(Reservation::count())->toBe(2);
});

it('ignores cancelled bookings when checking availability', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create();
    Reservation::factory()->forRoom($room)->between('2026-10-10', '2026-10-13')->status(ReservationStatus::Cancelled)->create();

    $response = $this->post(route('booking.store', $roomType), bookingPayload());

    $response->assertSessionHasNoErrors();
});

it('rejects more guests than the room sleeps', function () {
    $roomType = RoomType::factory()->create(['capacity' => 2]);
    Room::factory()->for($roomType)->create();

    $response = $this->post(route('booking.store', $roomType), bookingPayload(['adults' => 2, 'children' => 1]));

    $response->assertSessionHasErrors('adults');
    expect(Reservation::count())->toBe(0);
});

it('rejects stays in the past or with check-out before check-in', function (array $dates, string $field) {
    $roomType = RoomType::factory()->create();
    Room::factory()->for($roomType)->create();

    $response = $this->post(route('booking.store', $roomType), bookingPayload($dates));

    $response->assertSessionHasErrors($field);
    expect(Reservation::count())->toBe(0);
})->with([
    'past check-in' => [['check_in' => '2026-10-01', 'check_out' => '2026-10-04'], 'check_in'],
    'check-out before check-in' => [['check_in' => '2026-10-10', 'check_out' => '2026-10-09'], 'check_out'],
]);

it('shows the confirmation only to the browser that made the booking', function () {
    $reservation = Reservation::factory()->create();

    $this->get(route('booking.show', $reservation->code))->assertNotFound();

    $this->withSession(['booking.codes' => [$reservation->code]])
        ->get(route('booking.show', $reservation->code))
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/booking/show')
            ->where('reservation.code', $reservation->code));
});
