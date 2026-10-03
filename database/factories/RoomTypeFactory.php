<?php

namespace Database\Factories;

use App\Models\RoomType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<RoomType>
 */
class RoomTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->randomElement(['Standard', 'Deluxe', 'Superior', 'Family', 'Junior Suite', 'Executive Suite']).' Room';

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::lower(Str::random(4)),
            'description' => fake()->sentence(12),
            'base_rate' => fake()->randomElement([2500, 3500, 4800, 6500, 9000]),
            'capacity' => fake()->numberBetween(2, 4),
            'amenities' => ['Air conditioning', 'Wi-Fi', 'Smart TV'],
            'image_url' => null,
        ];
    }
}
