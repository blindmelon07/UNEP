<?php

use App\Enums\ReservationStatus;
use App\Enums\RoomStatus;
use App\Models\InventoryItem;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\StaffAccountSeeder;

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
});

it('creates a working login for every active demo account', function () {
    foreach (StaffAccountSeeder::ACCOUNTS as [$name, $email, $role, $isActive]) {
        $canSignIn = Auth::validate(['email' => $email, 'password' => 'password', 'is_active' => true]);

        expect($canSignIn)->toBe($isActive, $email);
    }

    expect(User::count())->toBe(count(StaffAccountSeeder::ACCOUNTS));
});

it('never books the same room for overlapping blocking stays', function () {
    $stays = Reservation::query()
        ->whereNotNull('room_id')
        ->whereIn('status', [...ReservationStatus::blocking(), ReservationStatus::CheckedOut])
        ->orderBy('check_in')
        ->get()
        ->groupBy('room_id');

    foreach ($stays as $roomStays) {
        $roomStays->reduce(function (?Reservation $previous, Reservation $stay) {
            if ($previous !== null) {
                expect($stay->check_in->greaterThanOrEqualTo($previous->check_out))->toBeTrue("{$stay->code} overlaps {$previous->code}");
            }

            return $stay;
        });
    }
});

it('marks exactly the rooms with in-house guests as occupied', function () {
    $inHouseRoomIds = Reservation::query()->where('status', ReservationStatus::CheckedIn)->pluck('room_id')->sort()->values()->all();
    $occupiedRoomIds = Room::query()->where('status', RoomStatus::Occupied)->pluck('id')->sort()->values()->all();

    expect($inHouseRoomIds)->not->toBeEmpty()->toBe($occupiedRoomIds);
});

it('settles the folio of every checked-out stay', function () {
    $checkedOut = Reservation::query()->where('status', ReservationStatus::CheckedOut)->get();

    expect($checkedOut)->not->toBeEmpty()
        ->and($checkedOut->filter(fn (Reservation $reservation) => $reservation->balance() !== 0.0))->toBeEmpty();
});

it('keeps every stock balance equal to the sum of its movements', function () {
    InventoryItem::query()->withSum('movements', 'quantity')->get()->each(function (InventoryItem $item) {
        expect((int) $item->movements_sum_quantity)->toBe($item->quantity, $item->name)
            ->and($item->quantity)->toBeGreaterThanOrEqual(0);
    });

    expect(InventoryItem::query()->lowStock()->count())->toBeGreaterThan(0);
});
