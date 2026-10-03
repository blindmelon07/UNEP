<?php

namespace App\Services;

use App\Enums\ReservationSource;
use App\Enums\ReservationStatus;
use App\Models\Guest;
use App\Models\Reservation;
use App\Models\RoomType;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReservationBooker
{
    public function __construct(private RoomAvailability $availability) {}

    /**
     * Book a stay, failing when no room of the type is free for the dates.
     *
     * @param  array{check_in: string, check_out: string, adults: int, children?: int|null, special_requests?: string|null, room_id?: int|null}  $details
     *
     * @throws ValidationException
     */
    public function create(Guest $guest, RoomType $roomType, array $details, ReservationSource $source, ReservationStatus $status): Reservation
    {
        return DB::transaction(function () use ($guest, $roomType, $details, $source, $status): Reservation {
            $roomType = RoomType::query()->lockForUpdate()->findOrFail($roomType->id);

            [$checkIn, $checkOut] = $this->ensureBookable($roomType, $details);

            $nights = Reservation::nightsBetween($checkIn, $checkOut);

            return Reservation::create([
                'code' => Reservation::generateCode(),
                'guest_id' => $guest->id,
                'room_type_id' => $roomType->id,
                'room_id' => $details['room_id'] ?? null,
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'adults' => $details['adults'],
                'children' => $details['children'] ?? 0,
                'status' => $status,
                'source' => $source,
                'nightly_rate' => $roomType->base_rate,
                'room_total' => round((float) $roomType->base_rate * $nights, 2),
                'special_requests' => $details['special_requests'] ?? null,
            ]);
        });
    }

    /**
     * Change the stay details of an existing booking, keeping its nightly rate unless the room type changes.
     *
     * @param  array{check_in: string, check_out: string, adults: int, children?: int|null, special_requests?: string|null, room_id?: int|null}  $details
     *
     * @throws ValidationException
     */
    public function update(Reservation $reservation, RoomType $roomType, array $details): Reservation
    {
        return DB::transaction(function () use ($reservation, $roomType, $details): Reservation {
            $roomType = RoomType::query()->lockForUpdate()->findOrFail($roomType->id);

            [$checkIn, $checkOut] = $this->ensureBookable($roomType, $details, $reservation->id);

            $nightlyRate = $roomType->is($reservation->roomType) ? $reservation->nightly_rate : $roomType->base_rate;

            $reservation->update([
                'room_type_id' => $roomType->id,
                'room_id' => $details['room_id'] ?? null,
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'adults' => $details['adults'],
                'children' => $details['children'] ?? 0,
                'nightly_rate' => $nightlyRate,
                'room_total' => round((float) $nightlyRate * Reservation::nightsBetween($checkIn, $checkOut), 2),
                'special_requests' => $details['special_requests'] ?? null,
            ]);

            return $reservation;
        });
    }

    /**
     * Validate dates, capacity, availability and any requested room.
     *
     * @param  array{check_in: string, check_out: string, adults: int, children?: int|null, room_id?: int|null}  $details
     * @return array{0: Carbon, 1: Carbon}
     *
     * @throws ValidationException
     */
    private function ensureBookable(RoomType $roomType, array $details, ?int $ignoreReservationId = null): array
    {
        $checkIn = Carbon::parse($details['check_in'])->startOfDay();
        $checkOut = Carbon::parse($details['check_out'])->startOfDay();

        if ($roomType->capacity < $details['adults'] + ($details['children'] ?? 0)) {
            throw ValidationException::withMessages([
                'adults' => "A {$roomType->name} sleeps at most {$roomType->capacity} guests.",
            ]);
        }

        if ($this->availability->availableCount($roomType, $checkIn, $checkOut, $ignoreReservationId) < 1) {
            throw ValidationException::withMessages([
                'room_type_id' => "No {$roomType->name} is available for the selected dates.",
            ]);
        }

        $roomId = $details['room_id'] ?? null;

        if ($roomId !== null && ! $this->availability->assignableRooms($roomType, $checkIn, $checkOut, $ignoreReservationId)->contains('id', $roomId)) {
            throw ValidationException::withMessages([
                'room_id' => 'That room is not free for the selected dates or is not of the chosen room type.',
            ]);
        }

        return [$checkIn, $checkOut];
    }
}
