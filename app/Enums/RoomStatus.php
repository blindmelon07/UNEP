<?php

namespace App\Enums;

use App\Enums\Concerns\HasOptions;

enum RoomStatus: string
{
    use HasOptions;

    case Available = 'available';
    case Occupied = 'occupied';
    case Cleaning = 'cleaning';
    case Maintenance = 'maintenance';
    case OutOfService = 'out_of_service';
}
