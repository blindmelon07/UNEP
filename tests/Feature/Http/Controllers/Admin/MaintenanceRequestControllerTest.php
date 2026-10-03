<?php

use App\Enums\MaintenanceStatus;
use App\Enums\Role;
use App\Enums\RoomStatus;
use App\Models\InventoryItem;
use App\Models\MaintenanceRequest;
use App\Models\Room;
use App\Models\User;

beforeEach(function () {
    $this->engineer = User::factory()->role(Role::Maintenance)->create();
});

it('takes a room out of order when a blocking request is logged', function () {
    $room = Room::factory()->create();

    $this->actingAs($this->engineer)->post(route('admin.maintenance-requests.store'), [
        'room_id' => $room->id,
        'title' => 'Aircon leaking',
        'priority' => 'high',
        'blocks_room' => '1',
    ])->assertSessionHasNoErrors();

    expect($room->refresh()->status)->toBe(RoomStatus::Maintenance);
    $this->assertDatabaseHas('maintenance_requests', [
        'room_id' => $room->id,
        'status' => 'open',
        'reported_by' => $this->engineer->id,
    ]);
});

it('leaves an occupied room occupied when a blocking request is logged', function () {
    $room = Room::factory()->create(['status' => RoomStatus::Occupied]);

    $this->actingAs($this->engineer)->post(route('admin.maintenance-requests.store'), [
        'room_id' => $room->id,
        'title' => 'Shower drain slow',
        'priority' => 'medium',
        'blocks_room' => '1',
    ]);

    expect($room->refresh()->status)->toBe(RoomStatus::Occupied);
});

it('returns the room to service and stamps the time once resolved', function () {
    $this->travelTo('2026-10-03 16:30:00');
    $room = Room::factory()->underMaintenance()->create();
    $request = MaintenanceRequest::factory()->for($room)->create(['blocks_room' => true]);

    $this->actingAs($this->engineer)->put(route('admin.maintenance-requests.update', $request), [
        'room_id' => $room->id,
        'title' => $request->title,
        'priority' => 'medium',
        'status' => 'resolved',
        'blocks_room' => '1',
        'resolution_notes' => 'Replaced the drain pipe.',
    ])->assertSessionHasNoErrors();

    expect($request->refresh())
        ->status->toBe(MaintenanceStatus::Resolved)
        ->resolved_at->toDateTimeString()->toBe('2026-10-03 16:30:00')
        ->and($room->refresh()->status)->toBe(RoomStatus::Available);
});

it('keeps the room out of order while another blocking request is still open', function () {
    $room = Room::factory()->underMaintenance()->create();
    $request = MaintenanceRequest::factory()->for($room)->create(['blocks_room' => true]);
    MaintenanceRequest::factory()->for($room)->create(['blocks_room' => true]);

    $this->actingAs($this->engineer)->put(route('admin.maintenance-requests.update', $request), [
        'room_id' => $room->id,
        'title' => $request->title,
        'priority' => 'medium',
        'status' => 'resolved',
        'blocks_room' => '1',
    ]);

    expect($room->refresh()->status)->toBe(RoomStatus::Maintenance);
});

it('requires either a room or a location', function () {
    $response = $this->actingAs($this->engineer)->post(route('admin.maintenance-requests.store'), [
        'title' => 'Something broke',
        'priority' => 'low',
    ]);

    $response->assertSessionHasErrors(['room_id', 'location']);
    $this->assertDatabaseCount('maintenance_requests', 0);
});

it('deducts issued parts from inventory and links them to the request', function () {
    $request = MaintenanceRequest::factory()->create();
    $item = InventoryItem::factory()->create(['quantity' => 6]);

    $this->actingAs($this->engineer)->post(route('admin.maintenance-requests.parts.store', $request), [
        'inventory_item_id' => $item->id,
        'quantity' => 2,
    ])->assertSessionHasNoErrors();

    expect($item->refresh()->quantity)->toBe(4);
    $this->assertDatabaseHas('stock_movements', [
        'inventory_item_id' => $item->id,
        'maintenance_request_id' => $request->id,
        'type' => 'out',
        'quantity' => -2,
    ]);
});
