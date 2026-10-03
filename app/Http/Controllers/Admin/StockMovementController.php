<?php

namespace App\Http\Controllers\Admin;

use App\Enums\StockMovementType;
use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Services\StockLedger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StockMovementController extends Controller
{
    /**
     * Receive, issue or recount stock for an item.
     */
    public function store(Request $request, InventoryItem $inventoryItem, StockLedger $ledger): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', Rule::enum(StockMovementType::class)],
            'quantity' => ['required', 'integer', 'min:0', 'max:1000000', Rule::when(
                $request->input('type') !== StockMovementType::Adjustment->value,
                ['gt:0'],
            )],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        $ledger->record(
            $inventoryItem,
            StockMovementType::from($validated['type']),
            (int) $validated['quantity'],
            $request->user(),
            $validated['notes'] ?? null,
        );

        Inertia::flash('success', 'Stock updated.');

        return back();
    }
}
