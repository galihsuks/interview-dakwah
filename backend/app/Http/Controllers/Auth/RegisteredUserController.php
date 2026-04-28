<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\GeminiAccount;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class RegisteredUserController extends BaseApiController
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make((string) $validated['password']),
        ]);

        GeminiAccount::createDefaultForUser((int) $user->id);

        event(new Registered($user));

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->created('Register berhasil.', [
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }
}
