<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InventoryCategoryController extends Controller
{
    /**
     * List inventory categories with item counts.
     */
    public function index(): Response
    {
        return Inertia::render('admin/inventory-categories/index', [
            'categories' => InventoryCategory::query()->withCount('items')->orderBy('name')->get(),
        ]);
    }

    /**
     * Store a new category.
     */
    public function store(Request $request): RedirectResponse
    {
        InventoryCategory::create($request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:inventory_categories'],
        ]));

        Inertia::flash('success', 'Category created.');

        return back();
    }

    /**
     * Rename a category.
     */
    public function update(Request $request, InventoryCategory $inventoryCategory): RedirectResponse
    {
        $inventoryCategory->update($request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('inventory_categories')->ignore($inventoryCategory)],
        ]));

        Inertia::flash('success', 'Category renamed.');

        return back();
    }

    /**
     * Delete an empty category.
     */
    public function destroy(InventoryCategory $inventoryCategory): RedirectResponse
    {
        if ($inventoryCategory->items()->exists()) {
            Inertia::flash('error', 'Move or delete the items in this category first.');

            return back();
        }

        $inventoryCategory->delete();

        Inertia::flash('success', 'Category deleted.');

        return back();
    }
}
