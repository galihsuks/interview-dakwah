<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

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

    public static function getAllByUserId(int $userId): array
    {
        $rows = DB::table('sales_pages')
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get();

        return self::attachVariantsToCollection($rows);
    }

    public static function findOneByIdAndUserId(int $id, int $userId): ?array
    {
        $row = DB::table('sales_pages')
            ->where('id', $id)
            ->where('user_id', $userId)
            ->first();

        if (! $row) {
            return null;
        }

        return self::attachVariants($row);
    }

    public static function createWithVariants(int $userId, array $payload, string $detectedLanguage, array $variants): array
    {
        $salesPageId = DB::transaction(function () use ($userId, $payload, $detectedLanguage, $variants) {
            $salesPageId = DB::table('sales_pages')->insertGetId([
                'user_id' => $userId,
                'product_name' => $payload['product_name'],
                'product_description' => $payload['product_description'],
                'key_features' => json_encode($payload['key_features'] ?? []),
                'target_audience' => $payload['target_audience'] ?? null,
                'price' => $payload['price'] ?? null,
                'unique_selling_points' => $payload['unique_selling_points'] ?? null,
                'detected_language' => $detectedLanguage,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            HtmlVariant::replaceBySalesPageId($salesPageId, $variants);

            return $salesPageId;
        });

        return self::findOneByIdAndUserId($salesPageId, $userId) ?? [];
    }

    public static function updateWithVariants(int $id, int $userId, array $payload, string $detectedLanguage, array $variants): ?array
    {
        $exists = DB::table('sales_pages')
            ->where('id', $id)
            ->where('user_id', $userId)
            ->exists();

        if (! $exists) {
            return null;
        }

        DB::transaction(function () use ($id, $userId, $payload, $detectedLanguage, $variants) {
            DB::table('sales_pages')
                ->where('id', $id)
                ->where('user_id', $userId)
                ->update([
                    'product_name' => $payload['product_name'],
                    'product_description' => $payload['product_description'],
                    'key_features' => json_encode($payload['key_features'] ?? []),
                    'target_audience' => $payload['target_audience'] ?? null,
                    'price' => $payload['price'] ?? null,
                    'unique_selling_points' => $payload['unique_selling_points'] ?? null,
                    'detected_language' => $detectedLanguage,
                    'updated_at' => now(),
                ]);

            HtmlVariant::replaceBySalesPageId($id, $variants);
        });

        return self::findOneByIdAndUserId($id, $userId);
    }

    public static function deleteByIdAndUserId(int $id, int $userId): bool
    {
        $deleted = DB::table('sales_pages')
            ->where('id', $id)
            ->where('user_id', $userId)
            ->delete();

        return $deleted > 0;
    }

    private static function attachVariantsToCollection(object $rows): array
    {
        return collect($rows)
            ->map(fn (object $row) => self::attachVariants($row))
            ->all();
    }

    private static function attachVariants(object $row): array
    {
        $variants = HtmlVariant::getBySalesPageId((int) $row->id);

        return [
            'id' => (int) $row->id,
            'user_id' => (int) $row->user_id,
            'product_name' => (string) $row->product_name,
            'product_description' => (string) $row->product_description,
            'key_features' => json_decode((string) ($row->key_features ?? '[]'), true) ?: [],
            'target_audience' => $row->target_audience,
            'price' => $row->price,
            'unique_selling_points' => $row->unique_selling_points,
            'detected_language' => $row->detected_language,
            'html_variants' => $variants,
            'created_at' => $row->created_at,
            'updated_at' => $row->updated_at,
        ];
    }
}
