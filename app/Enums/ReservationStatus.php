<?php

namespace App\Enums;

use App\Enums\Concerns\HasOptions;

enum ReservationStatus: string
{
    use HasOptions;

    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case CheckedIn = 'checked_in';
    case CheckedOut = 'checked_out';
    case Cancelled = 'cancelled';

    /**
     * Get the statuses that hold a room for their date range.
     *
     * @return list<self>
     */
    public static function blocking(): array
    {
        return [self::Pending, self::Confirmed, self::CheckedIn];
    }

    /**
     * Determine whether the reservation details may still be edited.
     */
    public function isEditable(): bool
    {
        return in_array($this, [self::Pending, self::Confirmed], true);
    }
}
