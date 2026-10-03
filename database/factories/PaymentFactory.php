<?php

namespace Database\Factories;

use App\Enums\PaymentMethod;
use App\Models\Payment;
use App\Models\Reservation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
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
            'amount' => fake()->randomElement([1000, 2500, 5000]),
            'method' => fake()->randomElement(PaymentMethod::cases()),
            'reference' => null,
            'received_by' => null,
            'paid_at' => now(),
        ];
    }
}
