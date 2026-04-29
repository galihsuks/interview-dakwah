<?php

namespace App\Http\Controllers\Api;

use App\Models\AppLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LogController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => ['nullable', 'date'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'keyword' => ['nullable', 'string', 'max:255'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $data = AppLog::listByUserWithFilters((int) $request->user()->id, $validated);

        return $this->success('Logs loaded.', $data);
    }
}
