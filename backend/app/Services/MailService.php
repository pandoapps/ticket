<?php

namespace App\Services;

use App\Models\Order;
use App\Models\PlatformSetting;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Mail;

class MailService
{
    public function __construct(private readonly EmailLogger $emailLogger) {}

    public function send(
        Mailable $mailable,
        string $toEmail,
        string $subject,
        string $type,
        ?string $toName = null,
        ?Order $order = null,
    ): void {
        $body = null;
        try {
            $body = $mailable->render();
        } catch (\Throwable) {
            // rendering failure should not block delivery
        }

        $settings = PlatformSetting::current();

        if (! $settings->isMailConfigured()) {
            $this->emailLogger->logFailed($toEmail, $subject, $type, 'E-mail não configurado nas configurações da plataforma.', $toName, $order, $body);

            return;
        }

        $this->applyMailConfig($settings);

        try {
            Mail::to($toEmail, $toName)->send($mailable);
            $this->emailLogger->logSent($toEmail, $subject, $type, $toName, $order, $body);
        } catch (\Throwable $e) {
            $this->emailLogger->logFailed($toEmail, $subject, $type, $e->getMessage(), $toName, $order, $body);
        }
    }

    private function applyMailConfig(PlatformSetting $settings): void
    {
        config([
            'mail.default' => 'mailgun',
            'services.mailgun.domain' => $settings->mailgun_domain,
            'services.mailgun.secret' => $settings->mailgun_secret,
            'services.mailgun.endpoint' => $settings->mailgun_endpoint ?? 'api.mailgun.net',
            'mail.from.address' => $settings->mail_from_address,
            'mail.from.name' => $settings->mail_from_name ?? config('app.name'),
        ]);

        // Force the mailer to be recreated with the new config.
        app('mail.manager')->purge('mailgun');
    }
}
