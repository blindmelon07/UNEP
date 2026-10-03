<?php

namespace App\Services;

use App\Enums\StockMovementType;
use App\Models\InventoryItem;
use App\Models\MaintenanceRequest;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockLedger
{
    /**
     * Record a stock movement and update the item's on-hand quantity atomically.
     *
     * For an adjustment, `$quantity` is the counted quantity on hand; the stored movement holds the difference.
     *
     * @throws ValidationException
     */
    public function record(
        InventoryItem $item,
        StockMovementType $type,
        int $quantity,
        ?User $user = null,
        ?string $notes = null,
        ?MaintenanceRequest $maintenanceRequest = null,
    ): StockMovement {
        return DB::transaction(function () use ($item, $type, $quantity, $user, $notes, $maintenanceRequest): StockMovement {
            $item = InventoryItem::query()->lockForUpdate()->findOrFail($item->id);

            $change = match ($type) {
                StockMovementType::In => $quantity,
                StockMovementType::Out => -$quantity,
                StockMovementType::Adjustment => $quantity - $item->quantity,
            };

            if ($item->quantity + $change < 0) {
                throw ValidationException::withMessages([
                    'quantity' => "Only {$item->quantity} {$item->unit} of {$item->name} in stock.",
                ]);
            }

            $item->forceFill(['quantity' => $item->quantity + $change])->save();

            return $item->movements()->create([
                'type' => $type,
                'quantity' => $change,
                'balance_after' => $item->quantity,
                'notes' => $notes,
                'user_id' => $user?->id,
                'maintenance_request_id' => $maintenanceRequest?->id,
            ]);
        });
    }
}
