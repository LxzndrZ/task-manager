<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/profile/{id}/photo', [UserController::class, 'uploadProfilePhoto']);
    Route::get('/profile/{id}', [UserController::class, 'profile']);
    Route::patch('/profile/{id}', [UserController::class, 'updateProfile']);

    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/tasks', [TaskController::class, 'index']);
        Route::post('/tasks', [TaskController::class, 'store']);
        Route::put('/tasks/{id}', [TaskController::class, 'update']);
        Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);
    });

    Route::middleware('role:employee')->group(function () {
        Route::get('/my-tasks/{userId}', [TaskController::class, 'myTasks']);
        Route::patch('/tasks/{id}/status', [TaskController::class, 'updateStatus']);
    });
});



