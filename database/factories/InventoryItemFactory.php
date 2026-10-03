<?php

namespace Database\Factories;

use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryItem>
 */
class InventoryItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'inventory_category_id' => InventoryCategory::factory(),
            'sku' => fake()->unique()->bothify('SKU-####'),
            'name' => fake()->words(2, true),
            'unit' => fake()->randomElement(['pcs', 'box', 'bottle', 'roll']),
            'quantity' => fake()->numberBetween(20, 200),
            'reorder_level' => 10,
            'unit_cost' => fake()->randomFloat(2, 10, 500),
            'location' => 'Main storeroom',
        ];
    }

    /**
     * Indicate that the item is at or below its reorder level.
     */
    public function lowStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'quantity' => 3,
            'reorder_level' => 10,
        ]);
    }
}
