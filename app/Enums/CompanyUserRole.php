<?php

namespace App\Enums;

enum CompanyUserRole: string
{
    case Owner = 'owner';
    case Manager = 'manager';
    case Staff = 'staff';
}
