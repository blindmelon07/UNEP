<?php

namespace App\Enums;

use App\Enums\Concerns\HasOptions;

enum StockMovementType: string
{
    use HasOptions;

    case In = 'in';
    case Out = 'out';
    case Adjustment = 'adjustment';
}
