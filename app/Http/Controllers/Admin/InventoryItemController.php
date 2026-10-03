<?php

namespace App\Http\Controllers\Admin;

use App\Enums\StockMovementType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\InventoryItemRequest;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Services\StockLedger;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InventoryItemController extends Controller
{
    /**
     * List stock items with category, search and low-stock filters.
     */
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'integer'],
            'low_stock' => ['nullable', 'boolean'],
        ]);

        return Inertia::render('admin/inventory-items/index', [
            'items' => InventoryItem::query()
                ->with('category:id,name')
                ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->where(fn (Builder $query) => $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")))
                ->when($filters['category'] ?? null, fn (Builder $query, int|string $category) => $query->where('inventory_category_id', $category))
                ->when($filters['low_stock'] ?? false, fn (Builder $query) => $query->lowStock())
                ->orderBy('name')
                ->paginate(25)
                ->withQueryString(),
            'filters' => $filters,
            'categories' => InventoryCategory::query()->orderBy('name')->get(['id', 'name']),
            'lowStockCount' => InventoryItem::query()->lowStock()->count(),
        ]);
    }

    /**
     * Show the form for a new item.
     */
    public function create(): Response
    {
        return $this->form(null);
    }

    /**
     * Store a new item, recording any opening stock as a movement.
     */
    public function store(InventoryItemRequest $request, StockLedger $ledger): RedirectResponse
    {
        $item = DB::transaction(function () use ($request, $ledger): InventoryItem {
            $item = InventoryItem::create($request->safe()->except('opening_quantity'));

            if ($request->integer('opening_quantity') > 0) {
                $ledger->record($item, StockMovementType::In, $request->integer('opening_quantity'), $request->user(), 'Opening stock');
            }

            return $item;
        });

        Inertia::flash('success', 'Item created.');

        return to_route('admin.inventory-items.show', $item);
    }

    /**
     * Show an item with its stock movement history.
     */
    public function show(InventoryItem $inventoryItem): Response
    {
        return Inertia::render('admin/inventory-items/show', [
            'item' => $inventoryItem->load('category:id,name'),
            'movements' => $inventoryItem->movements()
                ->with(['user:id,name', 'maintenanceRequest:id,title'])
                ->latest('id')
                ->paginate(20),
            'movementTypes' => StockMovementType::options(),
        ]);
    }

    /**
     * Show the form for editing an item.
     */
    public function edit(InventoryItem $inventoryItem): Response
    {
        return $this->form($inventoryItem);
    }

    /**
     * Update an item's details. Quantities change only through stock movements.
     */
    public function update(InventoryItemRequest $request, InventoryItem $inventoryItem): RedirectResponse
    {
        $inventoryItem->update($request->validated());

        Inertia::flash('success', 'Item updated.');

        return to_route('admin.inventory-items.show', $inventoryItem);
    }

    /**
     * Delete an item and its movement history.
     */
    public function destroy(InventoryItem $inventoryItem): RedirectResponse
    {
        $inventoryItem->delete();

        Inertia::flash('success', 'Item deleted.');

        return to_route('admin.inventory-items.index');
    }

    /**
     * Render the shared create/edit form.
     */
    private function form(?InventoryItem $item): Response
    {
        return Inertia::render('admin/inventory-items/form', [
            'item' => $item,
            'categories' => InventoryCategory::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }
}
