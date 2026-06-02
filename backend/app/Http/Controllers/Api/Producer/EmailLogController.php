<?php

namespace App\Http\Controllers\Api\Producer;

use App\Http\Controllers\Controller;
use App\Models\EmailLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $producer = $request->attributes->get('producer') ?? $request->user()->producer()->firstOrFail();

        $query = EmailLog::where('producer_id', $producer->id)->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($q = trim((string) $request->query('q', ''))) {
            $query->where(fn ($w) => $w
                ->where('to_email', 'like', "%{$q}%")
                ->orWhere('to_name', 'like', "%{$q}%")
            );
        }

        $logs = $query->paginate(30);

        return response()->json([
            'data' => $logs->getCollection()->map(fn (EmailLog $l) => [
                'id' => $l->id,
                'to_email' => $l->to_email,
                'to_name' => $l->to_name,
                'subject' => $l->subject,
                'type' => $l->type,
                'status' => $l->status,
                'error' => $l->error,
                'order_id' => $l->order_id,
                'created_at' => $l->created_at?->toIso8601String(),
            ])->values(),
            'meta' => ['total' => $logs->total(), 'page' => $logs->currentPage(), 'last_page' => $logs->lastPage()],
        ]);
    }
}
