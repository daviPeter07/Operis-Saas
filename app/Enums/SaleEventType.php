<?php

namespace App\Enums;

enum SaleEventType: string
{
    case Created = 'created';
    case Updated = 'updated';
    case PaymentReceived = 'payment_received';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case Delivered = 'delivered';
}
