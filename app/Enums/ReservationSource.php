<?php

namespace App\Enums;

use App\Enums\Concerns\HasOptions;

enum ReservationSource: string
{
    use HasOptions;

    case WalkIn = 'walk_in';
    case Phone = 'phone';
    case Online = 'online';
}
