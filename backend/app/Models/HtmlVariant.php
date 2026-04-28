<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class HtmlVariant extends Model
{
    protected $fillable = [
        'sales_page_id',
        'label',
        'plain_html',
    ];

    public static function getBySalesPageId(int $salesPageId): array
    {
        return DB::table('html_variants')
            ->where('sales_page_id', $salesPageId)
            ->orderBy('id')
            ->get()
            ->map(function (object $row) {
                return [
                    'id' => (int) $row->id,
                    'sales_page_id' => (int) $row->sales_page_id,
                    'label' => (string) $row->label,
                    'plain_html' => (string) $row->plain_html,
                    'created_at' => $row->created_at,
                    'updated_at' => $row->updated_at,
                ];
            })
            ->all();
    }

    public static function replaceBySalesPageId(int $salesPageId, array $variants): void
    {
        DB::table('html_variants')
            ->where('sales_page_id', $salesPageId)
            ->delete();

        if (count($variants) === 0) {
            return;
        }

        $rows = collect($variants)
            ->map(function (array $variant) use ($salesPageId) {
                return [
                    'sales_page_id' => $salesPageId,
                    'label' => $variant['label'],
                    'plain_html' => $variant['plain_html'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            })
            ->all();

        DB::table('html_variants')->insert($rows);
    }

    public static function findByIdAndUserId(int $variantId, int $userId): ?array
    {
        $row = DB::table('html_variants as hv')
            ->join('sales_pages as sp', 'sp.id', '=', 'hv.sales_page_id')
            ->where('hv.id', $variantId)
            ->where('sp.user_id', $userId)
            ->select([
                'hv.id',
                'hv.sales_page_id',
                'hv.label',
                'hv.plain_html',
                'hv.created_at',
                'hv.updated_at',
                'sp.user_id',
                'sp.product_name',
                'sp.product_description',
                'sp.key_features',
                'sp.target_audience',
                'sp.price',
                'sp.unique_selling_points',
                'sp.detected_language',
            ])
            ->first();

        if (! $row) {
            return null;
        }

        return [
            'id' => (int) $row->id,
            'sales_page_id' => (int) $row->sales_page_id,
            'label' => (string) $row->label,
            'plain_html' => (string) $row->plain_html,
            'created_at' => $row->created_at,
            'updated_at' => $row->updated_at,
            'sales_page' => [
                'user_id' => (int) $row->user_id,
                'product_name' => (string) $row->product_name,
                'product_description' => (string) $row->product_description,
                'key_features' => json_decode((string) ($row->key_features ?? '[]'), true) ?: [],
                'target_audience' => $row->target_audience,
                'price' => $row->price,
                'unique_selling_points' => $row->unique_selling_points,
                'detected_language' => $row->detected_language,
            ],
        ];
    }

    public static function updatePlainHtmlByIdAndUserId(int $variantId, int $userId, string $plainHtml): ?array
    {
        $exists = DB::table('html_variants as hv')
            ->join('sales_pages as sp', 'sp.id', '=', 'hv.sales_page_id')
            ->where('hv.id', $variantId)
            ->where('sp.user_id', $userId)
            ->exists();

        if (! $exists) {
            return null;
        }

        DB::table('html_variants')
            ->where('id', $variantId)
            ->update([
                'plain_html' => $plainHtml,
                'updated_at' => now(),
            ]);

        return self::findByIdAndUserId($variantId, $userId);
    }
}
