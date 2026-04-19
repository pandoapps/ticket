<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(Request $request): JsonResponse
    {
        $query = User::query()->latest();

        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }
        if ($q = $request->query('q')) {
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            });
        }

        $users = $query->paginate(20);

        return response()->json([
            'data' => UserResource::collection($users)->resolve(),
            'meta' => ['total' => $users->total(), 'page' => $users->currentPage()],
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $data = $request->validated();
        $password = $data['password'] ?? null;
        unset($data['password']);

        if (is_string($password) && $password !== '') {
            $data['password'] = Hash::make($password);
        }

        $user->update($data);
        $this->audit->log('admin.user.updated', $user);

        return response()->json(['data' => new UserResource($user->fresh())]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        abort_if($request->user()?->id === $user->id, 422, 'Você não pode excluir o próprio usuário.');

        $user->delete();
        $this->audit->log('admin.user.deleted', $user);

        return response()->json(null, 204);
    }
}
