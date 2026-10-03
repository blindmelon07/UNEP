<?php

namespace Database\Factories;

use App\Enums\RoomStatus;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Room>
 */
class RoomFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'room_type_id' => RoomType::factory(),
            'number' => (string) fake()->unique()->numberBetween(100, 999),
            'floor' => fake()->numberBetween(1, 9),
            'status' => RoomStatus::Available,
            'notes' => null,
        ];
    }

    /**
     * Indicate that the room is under maintenance.
     */
    public function underMaintenance(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RoomStatus::Maintenance,
        ]);
    }
}
