<?php

namespace App\Enums;

enum StockMovementType: string
{
    case Sale = 'sale';
    case SaleEdit = 'sale_edit';
    case SaleCancel = 'sale_cancel';
    case Purchase = 'purchase';
    case PurchaseEdit = 'purchase_edit';
    case PurchaseCancel = 'purchase_cancel';
}
