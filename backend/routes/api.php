<?php

use App\Http\Controllers\Api\GeminiAccountController;
use App\Http\Controllers\Api\SalesPageController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

require __DIR__.'/auth.php';

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('sales-pages', SalesPageController::class);
    Route::get('gemini-account', [GeminiAccountController::class, 'show']);
    Route::put('gemini-account', [GeminiAccountController::class, 'update']);
});
