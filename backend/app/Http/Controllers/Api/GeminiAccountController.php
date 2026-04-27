<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateGeminiAccountRequest;
use App\Models\GeminiAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GeminiAccountController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $account = $request->user()?->geminiAccount;

        return response()->json($this->toPayload($account));
    }

    public function update(UpdateGeminiAccountRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $account = GeminiAccount::firstOrNew([
            'user_id' => $request->user()->id,
        ]);

        if (($validated['clear_api_key'] ?? false) === true) {
            $account->api_key = null;
        } elseif (array_key_exists('api_key', $validated)) {
            $apiKey = trim((string) $validated['api_key']);
            $account->api_key = $apiKey !== '' ? $apiKey : null;
        }

        if (array_key_exists('model', $validated)) {
            $model = trim((string) $validated['model']);
            $account->model = $model !== '' ? $model : config('services.gemini.model', 'gemini-2.0-flash');
        } elseif (! $account->exists) {
            $account->model = config('services.gemini.model', 'gemini-2.0-flash');
        }

        if (array_key_exists('remaining_quota', $validated)) {
            $account->remaining_quota = $validated['remaining_quota'];
        }

        $account->save();

        return response()->json($this->toPayload($account->fresh()));
    }

    private function toPayload(?GeminiAccount $account): array
    {
        $fallbackModel = config('services.gemini.model', 'gemini-2.0-flash');

        return [
            'model' => $account?->model ?? $fallbackModel,
            'has_api_key' => filled($account?->api_key),
            'api_key_masked' => $account?->masked_api_key,
            'remaining_quota' => $account?->remaining_quota,
            'last_quota_synced_at' => $account?->last_quota_synced_at?->toISOString(),
            'updated_at' => $account?->updated_at?->toISOString(),
        ];
    }
}
