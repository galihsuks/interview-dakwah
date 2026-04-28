<?php

use App\Http\Controllers\Api\GeminiAccountController;
use App\Http\Controllers\Api\SalesPageController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [RegisteredUserController::class, 'store'])->middleware('throttle:10,1');
Route::post('/login', [AuthenticatedSessionController::class, 'store'])->middleware('throttle:10,1');
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->middleware('auth:sanctum');

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/sales-pages', [SalesPageController::class, 'index']);
    Route::get('/sales-pages/{id}', [SalesPageController::class, 'show']);
    Route::post('/sales-pages', [SalesPageController::class, 'store']);
    Route::put('/sales-pages/{id}', [SalesPageController::class, 'update']);
    Route::delete('/sales-pages/{id}', [SalesPageController::class, 'destroy']);

    Route::get('/gemini-account', [GeminiAccountController::class, 'show']);
    Route::put('/gemini-account', [GeminiAccountController::class, 'update']);
});
