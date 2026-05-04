<?php

namespace App\Enums;

enum FinancialStatus: string
{
    case Pending = 'pending';
    case Received = 'received';
    case Cancelled = 'cancelled';
}
