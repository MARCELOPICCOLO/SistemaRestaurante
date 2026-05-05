<?php
// routes/api.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\TableController;

// ========== PRODUTOS ==========
Route::apiResource('products', ProductController::class);
Route::get('/products/code/{code}', [ProductController::class, 'findByCode']);

// ========== CATEGORIAS ==========
Route::apiResource('categories', CategoryController::class);

// ========== MESAS ==========
Route::apiResource('tables', TableController::class);
Route::get('/tables/{tableId}/orders', [OrderController::class, 'getByTable']);

// ========== COMANDAS (ORDERS) ==========
Route::prefix('orders')->group(function () {
    Route::get('/', [OrderController::class, 'index']);
    Route::get('/{id}', [OrderController::class, 'show']);
    Route::post('/', [OrderController::class, 'store']);
    Route::delete('/{id}', [OrderController::class, 'destroy']);
    Route::post('/{id}/close', [OrderController::class, 'close']);
    Route::post('/{id}/items', [OrderController::class, 'addItem']);
    Route::get('/{id}/items', [OrderController::class, 'getItems']);
});

// ========== ORDER ITEMS (CRUCIAL PARA SEU ERRO 404) ==========
Route::prefix('order-items')->group(function () {
    Route::put('/{id}', [OrderController::class, 'updateItem']);
    Route::delete('/{id}', [OrderController::class, 'removeItem']);
});
