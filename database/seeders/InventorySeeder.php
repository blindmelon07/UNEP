<?php

namespace Database\Seeders;

use App\Enums\StockMovementType;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    /**
     * Catalog per category: name, unit, opening quantity, reorder level, unit cost, average weekly use.
     *
     * @var array<string, list<array{0: string, 1: string, 2: int, 3: int, 4: int, 5: int}>>
     */
    private const array CATALOG = [
        'Guest Amenities' => [
            ['Shampoo 30ml', 'bottle', 300, 100, 12, 45],
            ['Conditioner 30ml', 'bottle', 250, 100, 13, 35],
            ['Bath soap 25g', 'pcs', 280, 100, 9, 50],
            ['Dental kit', 'pcs', 200, 80, 15, 30],
            ['Slippers (pair)', 'pair', 150, 60, 35, 22],
            ['Drinking water 500ml', 'bottle', 400, 150, 15, 70],
        ],
        'Linen' => [
            ['Bath towel', 'pcs', 160, 60, 350, 6],
            ['Hand towel', 'pcs', 160, 60, 150, 7],
            ['Bed sheet (queen)', 'pcs', 90, 40, 650, 5],
            ['Pillowcase', 'pcs', 140, 50, 120, 6],
            ['Duvet cover', 'pcs', 50, 20, 1200, 2],
        ],
        'Cleaning Supplies' => [
            ['All-purpose cleaner 1L', 'bottle', 40, 12, 180, 4],
            ['Toilet bowl cleaner 1L', 'bottle', 30, 10, 145, 3],
            ['Glass cleaner 500ml', 'bottle', 24, 8, 120, 2],
            ['Garbage bags (roll)', 'roll', 30, 15, 95, 4],
            ['Microfiber cloth', 'pcs', 60, 20, 55, 3],
        ],
        'Engineering Spares' => [
            ['LED bulb 9W', 'pcs', 50, 20, 85, 3],
            ['Aircon filter', 'pcs', 12, 6, 450, 1],
            ['Faucet cartridge', 'pcs', 10, 5, 520, 1],
            ['Door lock battery (AA)', 'pcs', 80, 30, 25, 6],
            ['PVC pipe 1/2" (3m)', 'length', 10, 4, 160, 0],
        ],
        'Minibar' => [
            ['Potato chips 60g', 'pack', 120, 50, 40, 14],
            ['Soft drink can', 'can', 144, 60, 30, 18],
            ['Instant coffee sachet', 'sachet', 300, 100, 8, 40],
            ['Pili nut brittle (local)', 'pack', 60, 25, 95, 6],
        ],
        'Office & Front Desk' => [
            ['Key card', 'pcs', 100, 30, 45, 2],
            ['Thermal receipt paper', 'roll', 30, 12, 65, 3],
            ['Registration card pad', 'pad', 20, 8, 80, 1],
        ],
    ];

    /**
     * Create stock items with eight weeks of receipts and issues behind their current balances.
     */
    public function run(): void
    {
        $storekeeper = User::query()->where('email', 'inventory@hotel.test')->first();
        $housekeeper = User::query()->where('email', 'housekeeping@hotel.test')->first();
        $start = CarbonImmutable::today()->subWeeks(8);
        $sku = 1001;

        foreach (self::CATALOG as $categoryName => $items) {
            $category = InventoryCategory::create(['name' => $categoryName]);

            foreach ($items as [$name, $unit, $opening, $reorderLevel, $unitCost, $weeklyUse]) {
                $item = InventoryItem::factory()->create([
                    'inventory_category_id' => $category->id,
                    'sku' => 'SKU-'.$sku++,
                    'name' => $name,
                    'unit' => $unit,
                    'quantity' => 0,
                    'reorder_level' => $reorderLevel,
                    'unit_cost' => $unitCost,
                    'location' => $categoryName === 'Engineering Spares' ? 'Engineering workshop' : 'Main storeroom',
                ]);

                $balance = $this->move($item, StockMovementType::In, $opening, 0, $start->setTime(9, 0), $storekeeper?->id, 'Opening stock');

                // Leave roughly one item in five below its reorder level so the alerts have something to show.
                $skipsRestock = fake()->boolean(20);

                foreach (range(1, 8) as $week) {
                    $issueDay = $start->addWeeks($week)->subDays(fake()->numberBetween(1, 3))->setTime(fake()->numberBetween(8, 16), 0);
                    $used = min($balance, max(0, $weeklyUse + fake()->numberBetween(-(int) ceil($weeklyUse / 3), (int) ceil($weeklyUse / 3))));

                    if ($used > 0) {
                        $balance = $this->move($item, StockMovementType::Out, $used, $balance, $issueDay, $housekeeper?->id, fake()->randomElement([
                            'Issued to housekeeping', 'Floor par restock', 'Issued to front office', 'Weekly room replenishment',
                        ]));
                    }

                    if ($balance <= $reorderLevel && ! $skipsRestock && $week < 8) {
                        $balance = $this->move($item, StockMovementType::In, $opening - $balance, $balance, $issueDay->addDay(), $storekeeper?->id, 'PO-2026-'.fake()->numerify('####').' delivery');
                    }
                }

                if (fake()->boolean(10)) {
                    $counted = max(0, $balance - fake()->numberBetween(1, 3));
                    $balance = $this->move($item, StockMovementType::Adjustment, $counted - $balance, $balance, CarbonImmutable::today()->subDays(2)->setTime(17, 0), $storekeeper?->id, 'Month-end physical count');
                }

                $item->forceFill(['quantity' => $balance])->save();
            }
        }
    }

    /**
     * Record a dated movement and return the new balance.
     */
    private function move(InventoryItem $item, StockMovementType $type, int $quantity, int $balance, CarbonImmutable $at, ?int $userId, string $notes): int
    {
        $change = $type === StockMovementType::Out ? -$quantity : $quantity;
        $balance += $change;

        $item->movements()->forceCreate([
            'type' => $type,
            'quantity' => $change,
            'balance_after' => $balance,
            'user_id' => $userId,
            'notes' => $notes,
            'created_at' => $at,
            'updated_at' => $at,
        ]);

        return $balance;
    }
}
