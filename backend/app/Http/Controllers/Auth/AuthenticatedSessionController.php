<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends BaseApiController
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $remember = false;
        if (! Auth::attempt($validated, $remember)) {
            return $this->unprocessable('Email atau password salah.');
        }

        $user = $request->user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success('Login berhasil.', [
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $token = $request->user()?->currentAccessToken();
        if ($token) {
            $token->delete();
        }

        return $this->success('Logout berhasil.', null);
    }
}
