<?php

namespace Database\Factories;

use App\Models\Reservation;
use App\Models\ReservationCharge;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ReservationCharge>
 */
class ReservationChargeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reservation_id' => Reservation::factory(),
            'description' => fake()->randomElement(['Minibar', 'Room service', 'Laundry', 'Extra bed']),
            'amount' => fake()->randomElement([250, 500, 800]),
        ];
    }
}
