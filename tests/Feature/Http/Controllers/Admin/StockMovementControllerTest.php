<?php

use App\Enums\Role;
use App\Models\InventoryItem;
use App\Models\MaintenanceRequest;
use App\Models\StockMovement;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->storekeeper = User::factory()->role(Role::Inventory)->create();
    $this->item = InventoryItem::factory()->create(['quantity' => 20, 'reorder_level' => 5]);
});

it('updates on-hand stock and logs the movement', function (string $type, int $quantity, int $expectedBalance, int $expectedChange) {
    $this->actingAs($this->storekeeper)->post(route('admin.inventory-items.movements.store', $this->item), [
        'type' => $type,
        'quantity' => $quantity,
        'notes' => 'PO-1001',
    ])->assertSessionHasNoErrors();

    expect($this->item->refresh()->quantity)->toBe($expectedBalance);
    $this->assertDatabaseHas('stock_movements', [
        'inventory_item_id' => $this->item->id,
        'type' => $type,
        'quantity' => $expectedChange,
        'balance_after' => $expectedBalance,
        'user_id' => $this->storekeeper->id,
    ]);
})->with([
    'receive' => ['in', 15, 35, 15],
    'issue' => ['out', 8, 12, -8],
    'recount' => ['adjustment', 17, 17, -3],
]);

it('refuses to issue more than is on hand', function () {
    $response = $this->actingAs($this->storekeeper)->post(route('admin.inventory-items.movements.store', $this->item), [
        'type' => 'out',
        'quantity' => 21,
    ]);

    $response->assertSessionHasErrors(['quantity' => "Only 20 {$this->item->unit} of {$this->item->name} in stock."]);
    expect($this->item->refresh()->quantity)->toBe(20);
    $this->assertDatabaseCount('stock_movements', 0);
});

it('records opening stock as the first movement of a new item', function () {
    $this->actingAs($this->storekeeper)->post(route('admin.inventory-items.store'), [
        'inventory_category_id' => $this->item->inventory_category_id,
        'sku' => 'SKU-NEW',
        'name' => 'Hand towel',
        'unit' => 'pcs',
        'reorder_level' => 10,
        'unit_cost' => 120,
        'opening_quantity' => 50,
    ])->assertSessionHasNoErrors();

    $this->assertDatabaseHas('inventory_items', ['sku' => 'SKU-NEW', 'quantity' => 50]);
    $this->assertDatabaseHas('stock_movements', ['quantity' => 50, 'balance_after' => 50, 'notes' => 'Opening stock']);
});

it('keeps items whose stock was used on maintenance work', function () {
    StockMovement::factory()->for($this->item, 'item')->for(MaintenanceRequest::factory())->create([
        'type' => 'out',
        'quantity' => -1,
        'balance_after' => 19,
    ]);

    $response = $this->actingAs(User::factory()->admin()->create())->delete(route('admin.inventory-items.destroy', $this->item));

    $response->assertInertiaFlash('error', 'This item was used on maintenance work orders, so its history must be kept.');
    $this->assertModelExists($this->item);
});

it('filters the list to items at or below their reorder level', function () {
    $lowItem = InventoryItem::factory()->create(['quantity' => 5, 'reorder_level' => 5]);

    $response = $this->actingAs($this->storekeeper)->get(route('admin.inventory-items.index', ['low_stock' => 1]));

    $response->assertInertia(fn (Assert $page) => $page
        ->has('items.data', 1)
        ->where('items.data.0.id', $lowItem->id)
        ->where('lowStockCount', 1));
});
