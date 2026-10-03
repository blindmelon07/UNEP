<?php

namespace App\Services;

use App\Enums\RoomStatus;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomType;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class RoomAvailability
{
    /**
     * Count rooms of the given type still free for the whole stay.
     */
    public function availableCount(RoomType $roomType, CarbonInterface $checkIn, CarbonInterface $checkOut, ?int $ignoreReservationId = null): int
    {
        $sellableRooms = $roomType->rooms()->where('status', '!=', RoomStatus::OutOfService)->count();

        $bookedRooms = Reservation::query()
            ->whereBelongsTo($roomType)
            ->blocking()
            ->overlapping($checkIn, $checkOut)
            ->when($ignoreReservationId, fn (Builder $query) => $query->whereKeyNot($ignoreReservationId))
            ->count();

        return max(0, $sellableRooms - $bookedRooms);
    }

    /**
     * Get the room types that can host the party for the stay, with an `available_rooms` count.
     *
     * @return Collection<int, RoomType>
     */
    public function availableRoomTypes(CarbonInterface $checkIn, CarbonInterface $checkOut, int $guests): Collection
    {
        $bookedByType = Reservation::query()
            ->blocking()
            ->overlapping($checkIn, $checkOut)
            ->selectRaw('room_type_id, count(*) as booked')
            ->groupBy('room_type_id')
            ->pluck('booked', 'room_type_id');

        return RoomType::query()
            ->where('capacity', '>=', $guests)
            ->withCount(['rooms as sellable_rooms' => fn (Builder $query) => $query->where('status', '!=', RoomStatus::OutOfService)])
            ->orderBy('base_rate')
            ->get()
            ->each(function (RoomType $roomType) use ($bookedByType): void {
                $roomType->setAttribute(
                    'available_rooms',
                    max(0, $roomType->sellable_rooms - (int) ($bookedByType[$roomType->id] ?? 0)),
                );
            })
            ->filter(fn (RoomType $roomType): bool => $roomType->available_rooms > 0)
            ->values();
    }

    /**
     * Get the specific rooms of a type that have no conflicting booking for the stay.
     *
     * @return Collection<int, Room>
     */
    public function assignableRooms(RoomType $roomType, CarbonInterface $checkIn, CarbonInterface $checkOut, ?int $ignoreReservationId = null): Collection
    {
        return $roomType->rooms()
            ->where('status', '!=', RoomStatus::OutOfService)
            ->whereDoesntHave('reservations', fn (Builder $query) => $query
                ->blocking()
                ->overlapping($checkIn, $checkOut)
                ->when($ignoreReservationId, fn (Builder $query) => $query->whereKeyNot($ignoreReservationId)))
            ->orderBy('number')
            ->get();
    }
}
