<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\StoryController;
use App\Http\Controllers\Api\ChapterController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AdminController;

/*
|--------------------------------------------------------------------------
| Public REST API Routes
|--------------------------------------------------------------------------
*/
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/stories', [StoryController::class, 'index']);
Route::get('/stories/{slug}', [StoryController::class, 'show']);
Route::get('/categories', [StoryController::class, 'categories']);
Route::get('/tags', [StoryController::class, 'tags']);

Route::get('/chapters/{id}', [ChapterController::class, 'show']);
Route::get('/stories/{storySlug}/chapters/{chapterSlug}', [ChapterController::class, 'showBySlug']);
Route::get('/chapters/{id}/comments', [ChapterController::class, 'comments']);

/*
|--------------------------------------------------------------------------
| Authenticated User Routes (Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::post('/chapters/{id}/unlock', [ChapterController::class, 'unlock']);
    Route::post('/chapters/{id}/comments', [ChapterController::class, 'addComment']);

    Route::get('/wallet', [WalletController::class, 'index']);
    Route::get('/wallet/transactions', [WalletController::class, 'transactions']);
    Route::post('/wallet/purchase', [WalletController::class, 'purchase']);
    Route::post('/wallet/verify/{id}', [WalletController::class, 'verifyPayment']);

    Route::get('/me/library', [UserController::class, 'library']);
    Route::get('/me/history', [UserController::class, 'history']);
    Route::put('/me/profile', [UserController::class, 'updateProfile']);
    Route::post('/stories/{id}/follow', [UserController::class, 'toggleFollow']);

    /*
    |--------------------------------------------------------------------------
    | Admin CMS Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/stories', [AdminController::class, 'stories']);
        Route::post('/stories', [AdminController::class, 'storeStory']);
        Route::post('/stories/{storyId}/chapters', [AdminController::class, 'storeChapter']);
        Route::get('/ads', [AdminController::class, 'ads']);
    });
});
