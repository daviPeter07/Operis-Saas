<?php

namespace App\Enums;

enum PurchaseEventType: string
{
    case Created = 'created';
    case Updated = 'updated';
    case PaymentMade = 'payment_made';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
}
