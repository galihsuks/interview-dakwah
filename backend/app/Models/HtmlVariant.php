<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class HtmlVariant extends Model
{
    protected $fillable = [
        'sales_page_id',
        'label',
        'plain_html',
    ];

    public function salesPage(): BelongsTo
    {
        return $this->belongsTo(SalesPage::class);
    }
}
