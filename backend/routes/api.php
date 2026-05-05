<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\TableController;

Route::apiResource('products', ProductController::class);
Route::apiResource('categories', CategoryController::class);
Route::get('/orders', [OrderController::class, 'index']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::post('/orders', [OrderController::class, 'store']);

Route::post('/orders/{id}/items', [OrderController::class, 'addItem']);
Route::put('/order-items/{id}', [OrderController::class, 'updateItem']);
Route::delete('/order-items/{id}', [OrderController::class, 'removeItem']);

Route::post('/orders/{id}/close', [OrderController::class, 'close']);
Route::delete('/orders/{id}', [OrderController::class, 'destroy']);

Route::apiResource('tables', TableController::class);
