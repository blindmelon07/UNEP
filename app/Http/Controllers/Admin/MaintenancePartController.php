<?php

namespace App\Http\Controllers\Admin;

use App\Enums\StockMovementType;
use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\MaintenanceRequest;
use App\Services\StockLedger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaintenancePartController extends Controller
{
    /**
     * Issue spare parts from inventory against a maintenance request.
     */
    public function store(Request $request, MaintenanceRequest $maintenanceRequest, StockLedger $ledger): RedirectResponse
    {
        $validated = $request->validate([
            'inventory_item_id' => ['required', 'integer', 'exists:inventory_items,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:100000'],
        ]);

        $ledger->record(
            InventoryItem::query()->findOrFail($request->integer('inventory_item_id')),
            StockMovementType::Out,
            (int) $validated['quantity'],
            $request->user(),
            "Used on maintenance #{$maintenanceRequest->id}: {$maintenanceRequest->title}",
            $maintenanceRequest,
        );

        Inertia::flash('success', 'Part issued from inventory.');

        return back();
    }
}
