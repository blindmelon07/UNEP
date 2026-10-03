<?php

namespace App\Enums;

use App\Enums\Concerns\HasOptions;

enum PaymentMethod: string
{
    use HasOptions;

    case Cash = 'cash';
    case Card = 'card';
    case Gcash = 'gcash';
    case BankTransfer = 'bank_transfer';
}
