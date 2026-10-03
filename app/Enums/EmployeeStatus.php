<?php

namespace App\Enums;

use App\Enums\Concerns\HasOptions;

enum EmployeeStatus: string
{
    use HasOptions;

    case Active = 'active';
    case OnLeave = 'on_leave';
    case Terminated = 'terminated';
}
