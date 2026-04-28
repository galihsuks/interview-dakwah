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
}
