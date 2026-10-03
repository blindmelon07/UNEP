<?php

namespace App\Models;

use Database\Factories\InventoryItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $inventory_category_id
 * @property string $sku
 * @property string $name
 * @property string $unit
 * @property int $quantity
 * @property int $reorder_level
 * @property string $unit_cost
 * @property string|null $location
 */
#[Fillable(['inventory_category_id', 'sku', 'name', 'unit', 'reorder_level', 'unit_cost', 'location'])]
class InventoryItem extends Model
{
    /** @use HasFactory<InventoryItemFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'reorder_level' => 'integer',
            'unit_cost' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<InventoryCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(InventoryCategory::class, 'inventory_category_id');
    }

    /**
     * @return HasMany<StockMovement, $this>
     */
    public function movements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    /**
     * Determine whether the item has reached its reorder level.
     */
    public function isLowStock(): bool
    {
        return $this->quantity <= $this->reorder_level;
    }

    /**
     * Limit to items at or below their reorder level.
     *
     * @param  Builder<InventoryItem>  $query
     */
    #[Scope]
    protected function lowStock(Builder $query): void
    {
        $query->whereColumn('quantity', '<=', 'reorder_level');
    }
}
