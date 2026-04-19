<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Producer = 'producer';
    case Customer = 'customer';
}
