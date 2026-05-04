<?php

namespace App\Enums;

enum ImportStatus: string
{
    case Preview = 'preview';
    case Confirmed = 'confirmed';
    case Failed = 'failed';
}
