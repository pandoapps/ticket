<?php

namespace App\Services;

use App\Models\EmailLog;
use App\Models\Order;
use Illuminate\Support\Facades\Log;

class EmailLogger
{
    public function logSent(
        string $toEmail,
        string $subject,
        string $type,
        ?string $toName = null,
        ?Order $order = null,
        ?string $body = null,
    ): EmailLog {
        return EmailLog::create([
            'to_email' => $toEmail,
            'to_name' => $toName,
            'subject' => $subject,
            'type' => $type,
            'status' => 'sent',
            'order_id' => $order?->id,
            'producer_id' => $order?->producer_id,
            'body' => $body,
        ]);
    }

    public function logFailed(
        string $toEmail,
        string $subject,
        string $type,
        string $error,
        ?string $toName = null,
        ?Order $order = null,
        ?string $body = null,
    ): EmailLog {
        Log::warning('Email send failed', [
            'to' => $toEmail,
            'subject' => $subject,
            'type' => $type,
            'error' => $error,
            'order_id' => $order?->id,
        ]);

        return EmailLog::create([
            'to_email' => $toEmail,
            'to_name' => $toName,
            'subject' => $subject,
            'type' => $type,
            'status' => 'failed',
            'error' => $error,
            'order_id' => $order?->id,
            'producer_id' => $order?->producer_id,
            'body' => $body,
        ]);
    }
}
