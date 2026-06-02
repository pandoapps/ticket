<?php

namespace App\Http\Middleware;

use App\Enums\ProducerStatus;
use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureApprovedProducer
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Admins bypass producer ownership checks; PosController resolves producer from event.
        if ($user?->role === UserRole::Admin) {
            return $next($request);
        }

        $producer = $user?->producer()->with('credentials')->first();

        if ($producer === null) {
            return response()->json(['message' => 'Cadastro de produtor não encontrado.'], 403);
        }

        if ($producer->status !== ProducerStatus::Approved) {
            return response()->json([
                'message' => 'Sua conta de produtor ainda não foi aprovada.',
                'status' => $producer->status->value,
            ], 403);
        }

        $request->attributes->set('producer', $producer);

        return $next($request);
    }
}
