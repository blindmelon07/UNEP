<?php

namespace Database\Factories;

use App\Enums\StockMovementType;
use App\Models\InventoryItem;
use App\Models\StockMovement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockMovement>
 */
class StockMovementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'inventory_item_id' => InventoryItem::factory(),
            'maintenance_request_id' => null,
            'user_id' => null,
            'type' => StockMovementType::In,
            'quantity' => 10,
            'balance_after' => 10,
            'notes' => null,
        ];
    }
}
