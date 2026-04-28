<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class BaseApiController extends Controller
{
    protected function success(string $message, mixed $data = null, int $status = 200): JsonResponse
    {
        return response()->json([
            'status' => $status,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    protected function created(string $message, mixed $data = null): JsonResponse
    {
        return $this->success($message, $data, 201);
    }

    protected function noContent(string $message = 'No content'): JsonResponse
    {
        return $this->success($message, null, 204);
    }

    protected function badRequest(string $message, mixed $data = null): JsonResponse
    {
        return $this->success($message, $data, 400);
    }

    protected function unauthorized(string $message = 'Unauthorized'): JsonResponse
    {
        return $this->success($message, null, 401);
    }

    protected function forbidden(string $message = 'Forbidden'): JsonResponse
    {
        return $this->success($message, null, 403);
    }

    protected function notFound(string $message = 'Data not found'): JsonResponse
    {
        return $this->success($message, null, 404);
    }

    protected function unprocessable(string $message, mixed $data = null): JsonResponse
    {
        return $this->success($message, $data, 422);
    }

    protected function serverError(string $message = 'Server error'): JsonResponse
    {
        return $this->success($message, null, 500);
    }
}
