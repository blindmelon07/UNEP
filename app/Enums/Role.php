<?php

namespace App\Enums;

use App\Enums\Concerns\HasOptions;

enum Role: string
{
    use HasOptions;

    case Admin = 'admin';
    case FrontDesk = 'front_desk';
    case Maintenance = 'maintenance';
    case Inventory = 'inventory';
    case HumanResources = 'human_resources';

    /**
     * Get a human readable label for the role.
     */
    public function label(): string
    {
        return match ($this) {
            self::FrontDesk => 'Front Desk',
            self::HumanResources => 'Human Resources',
            default => ucfirst($this->value),
        };
    }

    /**
     * Get the staff panel modules this role may access.
     *
     * @return list<string>
     */
    public function modules(): array
    {
        return match ($this) {
            self::Admin => ['reservations', 'inventory', 'maintenance', 'employees', 'users'],
            self::FrontDesk => ['reservations'],
            self::Maintenance => ['maintenance'],
            self::Inventory => ['inventory'],
            self::HumanResources => ['employees'],
        };
    }
}
