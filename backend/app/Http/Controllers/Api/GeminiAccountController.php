<?php

namespace App\Http\Controllers\Api;

use App\Models\GeminiAccount;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GeminiAccountController extends BaseApiController
{
    public function show(Request $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $settings = GeminiAccount::getSettingsByUserId($userId);

        if (! $settings) {
            GeminiAccount::createDefaultForUser($userId);
            $settings = GeminiAccount::getSettingsByUserId($userId);
        }

        return $this->success('Gemini settings loaded.', $this->toPayload($settings));
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'api_key' => ['nullable', 'string', 'max:500'],
            'clear_api_key' => ['nullable', 'boolean'],
        ]);

        $userId = (int) $request->user()->id;
        $settings = GeminiAccount::upsertSettingsByUserId($userId, $validated);

        return $this->success('Gemini settings updated.', $this->toPayload($settings));
    }

    private function toPayload(array $settings): array
    {
        $lastQuotaSyncedAt = $settings['last_quota_synced_at'];
        $updatedAt = $settings['updated_at'];

        return [
            'model' => $settings['model'] ?? config('services.gemini.model', 'gemini-2.0-flash'),
            'has_api_key' => filled($settings['api_key'] ?? null),
            'api_key_masked' => GeminiAccount::maskApiKey($settings['api_key'] ?? null),
            'rpm' => $settings['rpm'] ?? 5,
            'rpd' => $settings['rpd'] ?? 20,
            'tpm' => $settings['tpm'] ?? null,
            'last_quota_synced_at' => $lastQuotaSyncedAt ? Carbon::parse($lastQuotaSyncedAt)->toISOString() : null,
            'updated_at' => $updatedAt ? Carbon::parse($updatedAt)->toISOString() : null,
        ];
    }
}
