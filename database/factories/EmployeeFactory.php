<?php

namespace Database\Factories;

use App\Enums\EmployeeStatus;
use App\Models\Department;
use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Employee>
 */
class EmployeeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => null,
            'department_id' => Department::factory(),
            'employee_number' => fake()->unique()->numerify('EMP-#####'),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->numerify('09#########'),
            'position' => fake()->randomElement(['Receptionist', 'Room Attendant', 'Technician', 'Supervisor', 'Storekeeper']),
            'hire_date' => fake()->dateTimeBetween('-5 years', '-1 month'),
            'monthly_salary' => fake()->randomElement([18000, 22000, 28000, 35000]),
            'status' => EmployeeStatus::Active,
        ];
    }
}
