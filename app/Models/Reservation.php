<?php

namespace App\Models;

use App\Enums\ReservationSource;
use App\Enums\ReservationStatus;
use Carbon\CarbonInterface;
use Database\Factories\ReservationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $code
 * @property int $guest_id
 * @property int $room_type_id
 * @property int|null $room_id
 * @property Carbon $check_in
 * @property Carbon $check_out
 * @property int $adults
 * @property int $children
 * @property ReservationStatus $status
 * @property ReservationSource $source
 * @property string $nightly_rate
 * @property string $room_total
 * @property string|null $special_requests
 * @property Carbon|null $checked_in_at
 * @property Carbon|null $checked_out_at
 * @property-read Guest $guest
 * @property-read RoomType $roomType
 * @property-read Room|null $room
 */
#[Fillable([
    'code', 'guest_id', 'room_type_id', 'room_id', 'check_in', 'check_out', 'adults', 'children',
    'status', 'source', 'nightly_rate', 'room_total', 'special_requests', 'checked_in_at', 'checked_out_at',
])]
class Reservation extends Model
{
    /** @use HasFactory<ReservationFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'check_in' => 'date:Y-m-d',
            'check_out' => 'date:Y-m-d',
            'adults' => 'integer',
            'children' => 'integer',
            'status' => ReservationStatus::class,
            'source' => ReservationSource::class,
            'nightly_rate' => 'decimal:2',
            'room_total' => 'decimal:2',
            'checked_in_at' => 'datetime',
            'checked_out_at' => 'datetime',
        ];
    }

    /**
     * Generate a unique, human friendly booking code.
     */
    public static function generateCode(): string
    {
        do {
            $code = 'RSV-'.Str::upper(Str::random(8));
        } while (self::query()->where('code', $code)->exists());

        return $code;
    }

    /**
     * Calculate the number of nights between two dates.
     */
    public static function nightsBetween(CarbonInterface $checkIn, CarbonInterface $checkOut): int
    {
        return (int) $checkIn->copy()->startOfDay()->diffInDays($checkOut->copy()->startOfDay());
    }

    /**
     * @return BelongsTo<Guest, $this>
     */
    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class);
    }

    /**
     * @return BelongsTo<RoomType, $this>
     */
    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }

    /**
     * @return BelongsTo<Room, $this>
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * @return HasMany<Payment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * @return HasMany<ReservationCharge, $this>
     */
    public function charges(): HasMany
    {
        return $this->hasMany(ReservationCharge::class);
    }

    /**
     * Get the number of nights booked.
     */
    public function nights(): int
    {
        return self::nightsBetween($this->check_in, $this->check_out);
    }

    /**
     * Get the room total plus all extra charges.
     */
    public function grandTotal(): float
    {
        return (float) $this->room_total + (float) $this->charges()->sum('amount');
    }

    /**
     * Get the sum of all payments received.
     */
    public function amountPaid(): float
    {
        return (float) $this->payments()->sum('amount');
    }

    /**
     * Get the amount still owed by the guest.
     */
    public function balance(): float
    {
        return round($this->grandTotal() - $this->amountPaid(), 2);
    }

    /**
     * Limit to reservations that currently hold inventory (not cancelled or checked out).
     *
     * @param  Builder<Reservation>  $query
     */
    #[Scope]
    protected function blocking(Builder $query): void
    {
        $query->whereIn('status', ReservationStatus::blocking());
    }

    /**
     * Limit to reservations whose stay overlaps the given dates.
     *
     * @param  Builder<Reservation>  $query
     */
    #[Scope]
    protected function overlapping(Builder $query, CarbonInterface $checkIn, CarbonInterface $checkOut): void
    {
        $query->whereDate('check_in', '<', $checkOut->toDateString())
            ->whereDate('check_out', '>', $checkIn->toDateString());
    }
}
