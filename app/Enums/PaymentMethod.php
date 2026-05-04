<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Cash = 'cash';
    case Pix = 'pix';
    case Card = 'card';
    case Installment = 'installment';
}
