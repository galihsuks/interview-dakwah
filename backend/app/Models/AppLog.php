<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class AppLog extends Model
{
    protected $table = 'logs';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'level',
        'message',
        'context',
    ];

    public static function write(?int $userId, string $level, string $requestId, string $rawMessage, array $context = []): void
    {
        $userLabel = $userId !== null ? (string) $userId : 'GUEST';
        $prefixedMessage = '['.$userLabel.']['.$requestId.'] '.$rawMessage;

        DB::table('logs')->insert([
            'id' => self::generateId(),
            'user_id' => $userId,
            'level' => $level,
            'message' => $prefixedMessage,
            'context' => json_encode($context, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public static function listByUserWithFilters(int $userId, array $filters): array
    {
        $perPage = max(min((int) ($filters['per_page'] ?? 10), 100), 1);
        $page = max((int) ($filters['page'] ?? 1), 1);
        $offset = ($page - 1) * $perPage;

        $query = DB::table('logs')
            ->where('user_id', $userId);

        if (! empty($filters['date'])) {
            $query->whereDate('created_at', $filters['date']);
        }

        if (! empty($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }

        if (! empty($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }

        if (! empty($filters['keyword'])) {
            $keyword = '%'.$filters['keyword'].'%';
            $query->where(function ($subQuery) use ($keyword) {
                $subQuery->where('message', 'like', $keyword)
                    ->orWhere('context', 'like', $keyword);
            });
        }

        $total = (clone $query)->count();
        $rows = $query->orderByDesc('created_at')->offset($offset)->limit($perPage)->get();

        return [
            'items' => collect($rows)->map(function (object $row) {
                return [
                    'id' => (string) $row->id,
                    'user_id' => $row->user_id !== null ? (int) $row->user_id : null,
                    'level' => (string) $row->level,
                    'message' => (string) $row->message,
                    'context' => is_string($row->context) ? (json_decode($row->context, true) ?: []) : [],
                    'created_at' => $row->created_at,
                    'updated_at' => $row->updated_at,
                ];
            })->all(),
            'pagination' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => (int) ceil($total / $perPage),
            ],
        ];
    }

    private static function generateId(): string
    {
        return now()->valueOf().'-'.bin2hex(random_bytes(4));
    }
}
