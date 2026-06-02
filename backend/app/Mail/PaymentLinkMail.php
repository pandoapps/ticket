<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentLinkMail extends Mailable
{
    use Queueable, SerializesModels;

    public readonly string $frontendUrl;

    public function __construct(public readonly Order $order)
    {
        $this->frontendUrl = rtrim((string) (env('FRONTEND_URL') ?: config('app.url')), '/');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Seu ingresso está quase garantido — '.$this->order->event?->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.payment-link',
        );
    }
}
