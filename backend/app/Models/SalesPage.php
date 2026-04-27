<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalesPage extends Model
{
    protected $fillable = [
        'user_id',
        'product_name',
        'product_description',
        'key_features',
        'target_audience',
        'price',
        'unique_selling_points',
        'detected_language',
    ];

    protected function casts(): array
    {
        return [
            'key_features' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function htmlVariants(): HasMany
    {
        return $this->hasMany(HtmlVariant::class);
    }
}
