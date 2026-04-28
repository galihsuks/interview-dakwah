<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Throwable;

class GeminiAccount extends Model
{
    protected $fillable = [
        'user_id',
        'api_key',
        'model',
        'rpm',
        'rpd',
        'tpm',
        'last_quota_synced_at',
    ];

    public static function getSettingsByUserId(int $userId): ?array
    {
        $row = DB::table('gemini_accounts')->where('user_id', $userId)->first();

        if (! $row) {
            return null;
        }

        $apiKey = self::decryptApiKey($row->api_key);

        return [
            'id' => (int) $row->id,
            'user_id' => (int) $row->user_id,
            'api_key' => $apiKey,
            'model' => (string) $row->model,
            'rpm' => (int) $row->rpm,
            'rpd' => (int) $row->rpd,
            'tpm' => $row->tpm !== null ? (int) $row->tpm : null,
            'last_quota_synced_at' => $row->last_quota_synced_at,
            'updated_at' => $row->updated_at,
        ];
    }

    public static function upsertSettingsByUserId(int $userId, array $payload): array
    {
        $existing = self::getSettingsByUserId($userId);

        if (! $existing) {
            self::createDefaultForUser($userId);
            $existing = self::getSettingsByUserId($userId);
        }

        $apiKey = $existing['api_key'] ?? null;
        if (($payload['clear_api_key'] ?? false) === true) {
            $apiKey = null;
        } elseif (array_key_exists('api_key', $payload)) {
            $apiKey = trim((string) $payload['api_key']) ?: null;
        }

        DB::table('gemini_accounts')
            ->where('user_id', $userId)
            ->update([
                'api_key' => $apiKey !== null ? Crypt::encryptString($apiKey) : null,
                'updated_at' => now(),
            ]);

        return self::getSettingsByUserId($userId) ?? [];
    }

    public static function createDefaultForUser(int $userId): void
    {
        $apiKey = config('services.gemini.api_key');

        DB::table('gemini_accounts')->insert([
            'user_id' => $userId,
            'api_key' => filled($apiKey) ? Crypt::encryptString((string) $apiKey) : null,
            'model' => config('services.gemini.model', 'gemini-2.0-flash'),
            'rpm' => 5,
            'rpd' => 20,
            'tpm' => 250000,
            'last_quota_synced_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private static function decryptApiKey(mixed $value): ?string
    {
        if (! is_string($value) || $value === '') {
            return null;
        }

        try {
            return Crypt::decryptString($value);
        } catch (Throwable) {
            return null;
        }
    }

    public static function maskApiKey(?string $apiKey): ?string
    {
        if (! filled($apiKey)) {
            return null;
        }

        $visiblePrefix = substr($apiKey, 0, 6);
        $visibleSuffix = substr($apiKey, -4);

        return $visiblePrefix.str_repeat('*', 12).$visibleSuffix;
    }
}
