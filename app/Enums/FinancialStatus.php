<?php

namespace App\Enums;

enum FinancialStatus: string
{
    case Pending = 'pending';
    case Partial = 'partial';
    case Received = 'received';
    case Cancelled = 'cancelled';
}
