<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ProducerStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateProducerRequest;
use App\Http\Resources\ProducerResource;
use App\Models\Producer;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProducerController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(Request $request): JsonResponse
    {
        $query = Producer::with('user')->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($q = $request->query('q')) {
            $query->where(function ($sub) use ($q) {
                $sub->where('company_name', 'like', "%{$q}%")
                    ->orWhere('document', 'like', "%{$q}%")
                    ->orWhereHas('user', fn ($u) => $u->where('email', 'like', "%{$q}%"));
            });
        }

        $producers = $query->paginate(20);

        return response()->json([
            'data' => ProducerResource::collection($producers)->resolve(),
            'meta' => ['total' => $producers->total(), 'page' => $producers->currentPage()],
        ]);
    }

    public function show(Producer $producer): JsonResponse
    {
        $producer->load(['user', 'credentials']);

        return response()->json(['data' => new ProducerResource($producer)]);
    }

    public function update(UpdateProducerRequest $request, Producer $producer): JsonResponse
    {
        $data = $request->validated();
        $status = ProducerStatus::from($data['status']);

        $payload = [
            'company_name' => $data['company_name'],
            'document' => $data['document'],
            'phone' => $data['phone'] ?? null,
            'status' => $status,
        ];

        if ($status === ProducerStatus::Approved) {
            $payload['approved_at'] = $producer->approved_at ?? now();
            $payload['blocked_at'] = null;
            $payload['blocked_reason'] = null;
        } elseif ($status === ProducerStatus::Blocked) {
            $payload['blocked_at'] = $producer->blocked_at ?? now();
            $payload['blocked_reason'] = $data['blocked_reason'] ?? $producer->blocked_reason;
        } else {
            $payload['approved_at'] = null;
            $payload['blocked_at'] = null;
            $payload['blocked_reason'] = null;
        }

        $producer->update($payload);
        $this->audit->log('admin.producer.updated', $producer);

        return response()->json(['data' => new ProducerResource($producer->fresh('user'))]);
    }

    public function destroy(Producer $producer): JsonResponse
    {
        $producer->delete();
        $this->audit->log('admin.producer.deleted', $producer);

        return response()->json(null, 204);
    }

    public function approve(Producer $producer): JsonResponse
    {
        $producer->update([
            'status' => ProducerStatus::Approved,
            'approved_at' => now(),
            'blocked_at' => null,
            'blocked_reason' => null,
        ]);

        $this->audit->log('producer.approved', $producer);

        return response()->json(['data' => new ProducerResource($producer->fresh('user'))]);
    }

    public function block(Request $request, Producer $producer): JsonResponse
    {
        $reason = $request->input('reason');

        $producer->update([
            'status' => ProducerStatus::Blocked,
            'blocked_at' => now(),
            'blocked_reason' => is_string($reason) ? $reason : null,
        ]);

        $this->audit->log('producer.blocked', $producer, ['reason' => $reason]);

        return response()->json(['data' => new ProducerResource($producer->fresh('user'))]);
    }
}
