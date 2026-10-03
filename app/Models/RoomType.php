<?php

namespace App\Models;

use Database\Factories\RoomTypeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property string $base_rate
 * @property int $capacity
 * @property list<string>|null $amenities
 * @property string|null $image_url
 * @property-read int $sellable_rooms Present when loaded with the sellable rooms count.
 * @property-read int|null $available_rooms Present on results from RoomAvailability::availableRoomTypes().
 */
#[Fillable(['name', 'slug', 'description', 'base_rate', 'capacity', 'amenities', 'image_url'])]
class RoomType extends Model
{
    /** @use HasFactory<RoomTypeFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'base_rate' => 'decimal:2',
            'capacity' => 'integer',
            'amenities' => 'array',
        ];
    }

    /**
     * @return HasMany<Room, $this>
     */
    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class);
    }

    /**
     * @return HasMany<Reservation, $this>
     */
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }
}
