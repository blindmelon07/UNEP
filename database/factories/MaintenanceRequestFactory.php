<?php

namespace Database\Factories;

use App\Enums\MaintenancePriority;
use App\Enums\MaintenanceStatus;
use App\Models\MaintenanceRequest;
use App\Models\Room;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MaintenanceRequest>
 */
class MaintenanceRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'room_id' => Room::factory(),
            'location' => null,
            'title' => fake()->randomElement(['Leaking faucet', 'Aircon not cooling', 'Broken lamp', 'Clogged drain', 'TV no signal']),
            'description' => fake()->sentence(),
            'priority' => MaintenancePriority::Medium,
            'status' => MaintenanceStatus::Open,
            'blocks_room' => false,
            'reported_by' => null,
            'assigned_to' => null,
        ];
    }
}
