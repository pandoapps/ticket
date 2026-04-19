<?php

namespace App\Enums;

enum ProducerStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Blocked = 'blocked';
}
