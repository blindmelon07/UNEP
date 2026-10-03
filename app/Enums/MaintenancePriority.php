<?php

namespace App\Enums;

use App\Enums\Concerns\HasOptions;

enum MaintenancePriority: string
{
    use HasOptions;

    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';
    case Urgent = 'urgent';
}
