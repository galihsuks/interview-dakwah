<?php

namespace App\Http\Middleware;

use App\Models\AppLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class ApiDbLogger
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($this->shouldSkipLogging($request->path())) {
            return $next($request);
        }

        $requestId = $request->headers->get('X-Request-Id') ?: (string) now()->valueOf().'-'.bin2hex(random_bytes(3));
        $request->attributes->set('request_id', $requestId);
        $userId = $request->user()?->id;
        $actionName = $this->resolveActionName($request->path());
        $requestPayload = $this->buildRequestPayload($request, $userId);

        AppLog::write(
            $userId,
            'info',
            $requestId,
            'Request API '.$request->method().' '.$actionName,
            [
                'path' => $request->path(),
                'dataRequest' => $requestPayload,
            ]
        );

        try {
            $response = $next($request);
        } catch (Throwable $throwable) {
            AppLog::write(
                $userId,
                'error',
                $requestId,
                'Response API '.$request->method().' '.$actionName,
                [
                    'path' => $request->path(),
                    'dataResponse' => [
                        'status' => 500,
                        'message' => $throwable->getMessage(),
                        'data' => null,
                    ],
                ]
            );
            throw $throwable;
        }

        $status = $response->getStatusCode();
        $level = $status >= 500 ? 'error' : ($status >= 400 ? 'warning' : 'info');

        AppLog::write(
            $userId,
            $level,
            $requestId,
            'Response API '.$request->method().' '.$actionName,
            [
                'path' => $request->path(),
                'dataResponse' => $this->extractResponsePayload($request, $response, $status),
            ]
        );

        $response->headers->set('X-Request-Id', $requestId);

        return $response;
    }

    private function resolveActionName(string $path): string
    {
        return match (true) {
            str_starts_with($path, 'api/sales-pages') => 'Sales page',
            str_starts_with($path, 'api/html-variants') => 'HTML variant',
            str_starts_with($path, 'api/gemini-account') => 'Gemini account',
            str_starts_with($path, 'api/logs') => 'Logs',
            str_starts_with($path, 'api/login') => 'Login',
            str_starts_with($path, 'api/register') => 'Register',
            str_starts_with($path, 'api/logout') => 'Logout',
            default => 'Unknown',
        };
    }

    private function shouldSkipLogging(string $path): bool
    {
        return str_starts_with($path, 'api/logs');
    }

    private function buildRequestPayload(Request $request, ?int $userId): array
    {
        $payload = array_merge($request->query(), $request->all());

        foreach (['password', 'password_confirmation', 'token'] as $sensitiveKey) {
            if (array_key_exists($sensitiveKey, $payload)) {
                $payload[$sensitiveKey] = '***';
            }
        }

        $payload['request_user_id'] = $userId;

        return $payload;
    }

    private function extractResponsePayload(Request $request, Response $response, int $status): array
    {
        $content = $response->getContent();
        if (! is_string($content) || trim($content) === '') {
            return [
                'status' => $status,
                'message' => $status === 204 ? 'No content' : 'Empty response',
                'data' => null,
            ];
        }

        $decoded = json_decode($content, true);
        if (is_array($decoded)) {
            return $this->sanitizeResponsePayload($request, $decoded);
        }

        return [
            'status' => $status,
            'message' => 'Non-JSON response',
            'data' => mb_substr($content, 0, 2000),
        ];
    }

    private function sanitizeResponsePayload(Request $request, array $payload): array
    {
        if (! $request->isMethod('GET')) {
            return $payload;
        }

        // Keep logs lightweight for sales page list.
        if ($request->path() === 'api/sales-pages') {
            $items = $payload['data'] ?? null;
            if (is_array($items)) {
                foreach ($items as $index => $item) {
                    if (! is_array($item)) {
                        continue;
                    }

                    $variants = $item['html_variants'] ?? [];
                    $payload['data'][$index]['html_variants'] = is_array($variants) ? count($variants) : 0;
                }
            }

            return $payload;
        }

        // For sales page detail, strip large html blobs from variants.
        if (preg_match('#^api/sales-pages/\d+$#', $request->path()) === 1) {
            $variants = $payload['data']['html_variants'] ?? null;
            if (is_array($variants)) {
                foreach ($variants as $variantIndex => $variant) {
                    if (! is_array($variant)) {
                        continue;
                    }

                    unset($payload['data']['html_variants'][$variantIndex]['plain_html']);
                }
            }
        }

        return $payload;
    }
}
