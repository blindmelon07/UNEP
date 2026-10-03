<?php

namespace Database\Factories;

use App\Enums\ReservationSource;
use App\Enums\ReservationStatus;
use App\Models\Guest;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Reservation>
 */
class ReservationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $checkIn = now()->addDays(fake()->numberBetween(1, 30))->startOfDay();
        $nights = fake()->numberBetween(1, 5);
        $rate = 3500;

        return [
            'code' => Reservation::generateCode(),
            'guest_id' => Guest::factory(),
            'room_type_id' => RoomType::factory(),
            'room_id' => null,
            'check_in' => $checkIn,
            'check_out' => $checkIn->copy()->addDays($nights),
            'adults' => 2,
            'children' => 0,
            'status' => ReservationStatus::Confirmed,
            'source' => ReservationSource::WalkIn,
            'nightly_rate' => $rate,
            'room_total' => $rate * $nights,
            'special_requests' => null,
        ];
    }

    /**
     * Book a specific room (and its room type) for the reservation.
     */
    public function forRoom(Room $room): static
    {
        return $this->state(fn (array $attributes) => [
            'room_id' => $room->id,
            'room_type_id' => $room->room_type_id,
        ]);
    }

    /**
     * Set the stay dates, recalculating the room total.
     */
    public function between(string $checkIn, string $checkOut): static
    {
        return $this->state(function (array $attributes) use ($checkIn, $checkOut) {
            $nights = Reservation::nightsBetween(now()->parse($checkIn), now()->parse($checkOut));

            return [
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'room_total' => $attributes['nightly_rate'] * $nights,
            ];
        });
    }

    /**
     * Indicate that the reservation has the given status.
     */
    public function status(ReservationStatus $status): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => $status,
        ]);
    }
}
