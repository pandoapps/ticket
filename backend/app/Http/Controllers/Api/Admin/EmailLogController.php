<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Mail\PaymentLinkMail;
use App\Models\EmailLog;
use App\Services\MailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailLogController extends Controller
{
    public function __construct(private readonly MailService $mailer) {}

    public function index(Request $request): JsonResponse
    {
        $query = EmailLog::with(['order', 'producer'])
            ->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }
        if ($q = trim((string) $request->query('q', ''))) {
            $query->where(fn ($w) => $w
                ->where('to_email', 'like', "%{$q}%")
                ->orWhere('to_name', 'like', "%{$q}%")
                ->orWhere('subject', 'like', "%{$q}%")
            );
        }

        $logs = $query->paginate(30);

        return response()->json([
            'data' => $logs->getCollection()->map(fn (EmailLog $l) => $this->serialize($l))->values(),
            'meta' => ['total' => $logs->total(), 'page' => $logs->currentPage(), 'last_page' => $logs->lastPage()],
        ]);
    }

    public function resend(EmailLog $emailLog): JsonResponse
    {
        match ($emailLog->type) {
            'payment_link' => $this->resendPaymentLink($emailLog),
            default => abort(422, 'Reenvio não suportado para este tipo de e-mail.'),
        };

        return response()->json(['message' => 'E-mail reenviado com sucesso.']);
    }

    private function resendPaymentLink(EmailLog $log): void
    {
        abort_if(! $log->order_id, 422, 'Este e-mail não possui pedido associado e não pode ser reenviado.');

        $order = $log->order()->with(['event', 'producer'])->firstOrFail();

        $this->mailer->send(
            new PaymentLinkMail($order),
            $log->to_email,
            $log->subject,
            'payment_link',
            $log->to_name,
            $order,
        );
    }

    private function serialize(EmailLog $l): array
    {
        return [
            'id' => $l->id,
            'to_email' => $l->to_email,
            'to_name' => $l->to_name,
            'subject' => $l->subject,
            'type' => $l->type,
            'status' => $l->status,
            'error' => $l->error,
            'body' => $l->body,
            'order_id' => $l->order_id,
            'producer' => $l->producer ? ['id' => $l->producer->id, 'company_name' => $l->producer->company_name] : null,
            'created_at' => $l->created_at?->toIso8601String(),
        ];
    }
}
