<?php

namespace App\Enums;

use App\Enums\Concerns\HasOptions;

enum MaintenanceStatus: string
{
    use HasOptions;

    case Open = 'open';
    case InProgress = 'in_progress';
    case OnHold = 'on_hold';
    case Resolved = 'resolved';
    case Cancelled = 'cancelled';

    /**
     * Determine whether the request is finished.
     */
    public function isClosed(): bool
    {
        return in_array($this, [self::Resolved, self::Cancelled], true);
    }

    /**
     * Get the statuses for requests that still need work.
     *
     * @return list<self>
     */
    public static function active(): array
    {
        return [self::Open, self::InProgress, self::OnHold];
    }
}
