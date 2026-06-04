<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\AttachmentController;
use App\Http\Controllers\Api\CommentController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:api')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

Route::middleware('auth:api')->group(function () {
    Route::get('tasks', [TaskController::class, 'index']);
    Route::post('tasks', [TaskController::class, 'store']);
    Route::put('tasks/{task}', [TaskController::class, 'update']);
    Route::delete('tasks/{task}', [TaskController::class, 'destroy']);
    Route::get('tasks/{task}', [TaskController::class, 'show']);

    Route::post('tasks/{task}/attachments', [AttachmentController::class, 'store']);
    Route::get('attachments/{attachment}/download', [AttachmentController::class, 'download']);
    Route::delete('attachments/{attachment}', [AttachmentController::class, 'destroy']);

    // chunked upload
    Route::post('tasks/{task}/attachments/chunk', [AttachmentController::class, 'chunk']);

    // bulk and exportwi
    Route::post('tasks/bulk-update', [TaskBulkController::class, 'bulkUpdate']);
    Route::post('tasks/export',      [TaskBulkController::class, 'export']);

    Route::get('tasks/{task}/comments',    [CommentController::class, 'index']);
    Route::post('tasks/{task}/comments',   [CommentController::class, 'store']);
    Route::delete('comments/{comment}',    [CommentController::class, 'destroy']);
    Route::get('tasks/{task}/attachments', [AttachmentController::class, 'index']);
});