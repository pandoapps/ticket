<?php

namespace App\Http\Controllers\Api\Producer;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Producer\RegisterProducerRequest;
use App\Http\Resources\ProducerResource;
use App\Models\Producer;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProducerProfileController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function show(Request $request): JsonResponse
    {
        $producer = $request->user()->producer()->with(['user', 'credentials'])->first();

        if ($producer === null) {
            return response()->json(['data' => null]);
        }

        return response()->json(['data' => new ProducerResource($producer)]);
    }

    public function register(RegisterProducerRequest $request): JsonResponse
    {
        $user = $request->user();

        if ($user->producer()->exists()) {
            return response()->json(['message' => 'Cadastro de produtor já existe.'], 422);
        }

        $producer = Producer::create([
            ...$request->validated(),
            'user_id' => $user->id,
        ]);

        if ($user->role !== UserRole::Admin) {
            $user->update(['role' => UserRole::Producer->value]);
        }

        $this->audit->log('producer.registered', $producer);

        return response()->json(['data' => new ProducerResource($producer->load('user'))], 201);
    }
}
