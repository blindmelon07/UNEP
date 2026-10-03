<?php

use App\Enums\ReservationStatus;
use App\Enums\Role;
use App\Enums\RoomStatus;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\User;

beforeEach(function () {
    $this->frontDesk = User::factory()->role(Role::FrontDesk)->create();
});

/**
 * @return array<string, mixed>
 */
function roomPayload(Room $room, array $overrides = []): array
{
    return [
        'room_type_id' => $room->room_type_id,
        'number' => $room->number,
        'floor' => $room->floor,
        'status' => $room->status->value,
        ...$overrides,
    ];
}

it('updates a room', function () {
    $room = Room::factory()->create();

    $this->actingAs($this->frontDesk)
        ->put(route('admin.rooms.update', $room), roomPayload($room, ['floor' => 4, 'status' => 'out_of_service']))
        ->assertRedirect(route('admin.rooms.index'));

    expect($room->refresh())
        ->floor->toBe(4)
        ->status->toBe(RoomStatus::OutOfService);
});

it('does not let staff mark an empty room as occupied', function () {
    $room = Room::factory()->create();

    $response = $this->actingAs($this->frontDesk)->put(route('admin.rooms.update', $room), roomPayload($room, ['status' => 'occupied']));

    $response->assertSessionHasErrors(['status' => 'Rooms become occupied only through check-in.']);
    expect($room->refresh()->status)->toBe(RoomStatus::Available);
});

it('does not release an occupied room through the edit form', function () {
    $room = Room::factory()->create(['status' => RoomStatus::Occupied]);

    $response = $this->actingAs($this->frontDesk)->put(route('admin.rooms.update', $room), roomPayload($room, ['status' => 'available']));

    $response->assertSessionHasErrors(['status' => 'This room is occupied. Check the guest out to change its status.']);
    expect($room->refresh()->status)->toBe(RoomStatus::Occupied);
});

it('keeps the room type while bookings of that type are assigned to the room', function () {
    $room = Room::factory()->create();
    Reservation::factory()->forRoom($room)->status(ReservationStatus::Confirmed)->create();
    $otherType = RoomType::factory()->create();

    $response = $this->actingAs($this->frontDesk)->put(route('admin.rooms.update', $room), roomPayload($room, ['room_type_id' => $otherType->id]));

    $response->assertSessionHasErrors('room_type_id');
    expect($room->refresh()->room_type_id)->not->toBe($otherType->id);
});
