<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GeminiAccount extends Model
{
    protected $fillable = [
        'user_id',
        'api_key',
        'model',
        'remaining_quota',
        'last_quota_synced_at',
    ];

    protected function casts(): array
    {
        return [
            'api_key' => 'encrypted',
            'remaining_quota' => 'integer',
            'last_quota_synced_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getMaskedApiKeyAttribute(): ?string
    {
        if (blank($this->api_key)) {
            return null;
        }

        $key = (string) $this->api_key;
        $visiblePrefix = substr($key, 0, 6);
        $visibleSuffix = substr($key, -4);

        return $visiblePrefix.str_repeat('*', 12).$visibleSuffix;
    }
}
