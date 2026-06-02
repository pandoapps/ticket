<?php

namespace App\Enums;

enum SaleOrigin: string
{
    case Website = 'website';
    case Widget = 'widget';
    case Api = 'api';
    case Admin = 'admin';
    case Pos = 'pos';
}
