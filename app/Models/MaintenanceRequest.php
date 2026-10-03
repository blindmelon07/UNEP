<?php

namespace App\Models;

use App\Enums\MaintenancePriority;
use App\Enums\MaintenanceStatus;
use Database\Factories\MaintenanceRequestFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $room_id
 * @property string|null $location
 * @property string $title
 * @property string|null $description
 * @property MaintenancePriority $priority
 * @property MaintenanceStatus $status
 * @property bool $blocks_room
 * @property int|null $reported_by
 * @property int|null $assigned_to
 * @property string|null $resolution_notes
 * @property Carbon|null $resolved_at
 * @property-read Room|null $room
 */
#[Fillable([
    'room_id', 'location', 'title', 'description', 'priority', 'status', 'blocks_room',
    'reported_by', 'assigned_to', 'resolution_notes', 'resolved_at',
])]
class MaintenanceRequest extends Model
{
    /** @use HasFactory<MaintenanceRequestFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'priority' => MaintenancePriority::class,
            'status' => MaintenanceStatus::class,
            'blocks_room' => 'boolean',
            'resolved_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Room, $this>
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    /**
     * @return BelongsTo<Employee, $this>
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'assigned_to');
    }

    /**
     * @return HasMany<StockMovement, $this>
     */
    public function partsUsed(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }
}
