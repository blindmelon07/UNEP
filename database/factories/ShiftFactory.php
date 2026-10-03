<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\Shift;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Shift>
 */
class ShiftFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'employee_id' => Employee::factory(),
            'date' => now()->toDateString(),
            'starts_at' => '06:00',
            'ends_at' => '14:00',
            'notes' => null,
        ];
    }
}
