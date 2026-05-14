<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\DownloadController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\Product\PublicProductController;
use App\Http\Controllers\Product\CategoryController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\WishlistController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword'])
    ->name('password.reset');
Route::post('/refresh', [AuthController::class, 'refresh']);

Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);

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

    Route::post('/checkout', [CheckoutController::class, 'checkout']);
    Route::get('/orders/verify', [CheckoutController::class, 'verify']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::get('/orders/{id}/invoice', [OrderController::class, 'invoice']);

    Route::get('/products/{product}/download', [DownloadController::class, 'download']);

});


// Admin routes
Route::prefix('admin')->middleware(['jwt.auth', 'role:admin'])->group(function () {

    Route::get('/dashboard', [AdminController::class, 'dashboard']);

    Route::get('/users', [AdminController::class, 'users']);
    Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);

    Route::post('/orders/{id}/refund', [RefundController::class, 'refund']);
    Route::get('/refunds', [RefundController::class, 'index']);

    Route::get('/categories', [AdminCategoryController::class, 'index']);
    Route::post('/categories', [AdminCategoryController::class, 'store']);
    Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy']);

    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    Route::delete('/products/{product}/media/{media}', [ProductController::class, 'deleteMedia'])
     ->name('admin.products.media.delete');
     Route::get('/products/{product}', [ProductController::class, 'show']);

    Route::get('/logs', [AdminController::class, 'logs']);
    Route::delete('/logs/{id}', [AdminController::class, 'deleteLog']);
    Route::get('/logs/export', [AdminController::class, 'exportLogs']);

    Route::get('/orders', [AdminController::class, 'orders']);
    Route::get('/orders/{id}', [OrderController::class, 'adminShow']);        // ← Add this
    Route::get('/orders/{id}/invoice', [OrderController::class, 'adminInvoice']);

});



// PUBLIC SHOP PAGE MARKETPLACE
Route::get('/products', [PublicProductController::class, 'index']);
Route::get('/products/{slug}', [PublicProductController::class, 'show']);
//Dedicated Search Endpoint
Route::get('/search', [SearchController::class, 'search']);

//Categories
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category:slug}/products', [CategoryController::class, 'products']);


Route::prefix('cart')->group(function () {
    Route::get('/', [CartController::class, 'index']);
    Route::post('/add', [CartController::class, 'add']);
    Route::delete('/{id}', [CartController::class, 'remove']);
    Route::delete('/', [CartController::class, 'clear']);
});

Route::prefix('wishlist')->group(function () {
    Route::get('/', [WishlistController::class, 'index']);
    Route::post('/toggle', [WishlistController::class, 'toggle']);
    Route::delete('/{productId}', [WishlistController::class, 'remove']);
});
