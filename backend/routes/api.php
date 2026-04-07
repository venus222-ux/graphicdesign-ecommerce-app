<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\DownloadController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\Product\PublicProductController;
use App\Http\Controllers\Product\CategoryController;
use Illuminate\Support\Facades\Route;


// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword'])
    ->name('password.reset');
Route::post('/refresh', [AuthController::class, 'refresh']);

// Protected routes with auth + throttle
Route::middleware(['jwt.auth'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/dashboard', function () {
        return response()->json(['message' => 'User Dashboard']);
    });

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::delete('/profile', [AuthController::class, 'destroyProfile']);
});


// Admin routes
Route::prefix('admin')->middleware(['jwt.auth'])->group(function () {
    Route::get('/categories', [AdminCategoryController::class, 'index']);
    Route::post('/categories', [AdminCategoryController::class, 'store']);
    Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy']);

    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);

    Route::middleware('auth:api')->group(function () {
        Route::get('/products/{product}/download', [DownloadController::class, 'download']);
    });

    Route::get('/logs', [AdminController::class, 'logs']);
    Route::delete('/logs/{id}', [AdminController::class, 'deleteLog']);
    Route::get('/logs/export', [AdminController::class, 'exportLogs']);

});


// PUBLIC SHOP PAGE MARKETPLACE
Route::get('/products', [PublicProductController::class, 'index']);
Route::get('/products/{slug}', [PublicProductController::class, 'show']);
//Dedicated Search Endpoint
Route::get('/search', [SearchController::class, 'search']);

//Categories
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category:slug}/products', [CategoryController::class, 'products']);
