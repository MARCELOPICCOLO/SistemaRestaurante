<?php
// routes/api.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\TableController;
use App\Http\Controllers\ExpenseController;

// ========== PRODUTOS ==========
Route::apiResource('products', ProductController::class);
Route::get('/products/code/{code}', [ProductController::class, 'findByCode']);

// ========== CATEGORIAS ==========
Route::apiResource('categories', CategoryController::class);

// ========== MESAS ==========
// API Resource já cria: index, store, show, update, destroy
Route::apiResource('tables', TableController::class);
// Rota adicional para listar comandas de uma mesa específica
Route::get('/tables/{tableId}/orders', [OrderController::class, 'getByTable']);

// ========== COMANDAS (ORDERS) ==========
Route::prefix('orders')->group(function () {
    // ✅ Adicione explicitamente POST
    Route::match(['GET', 'POST'], '/summary', [OrderController::class, 'salesSummary']);

    // OU apenas POST
    Route::post('/summary', [OrderController::class, 'salesSummary']);

    // Depois as outras rotas
    Route::get('/', [OrderController::class, 'index']);
    Route::get('/{id}', [OrderController::class, 'show']);
    Route::post('/', [OrderController::class, 'store']);
    Route::delete('/{id}', [OrderController::class, 'destroy']);
    Route::post('/{id}/close', [OrderController::class, 'close']);
    Route::post('/{id}/items', [OrderController::class, 'addItem']);
    Route::get('/{id}/items', [OrderController::class, 'getItems']);
});

// ========== ORDER ITEMS ==========
Route::prefix('order-items')->group(function () {
    Route::put('/{id}', [OrderController::class, 'updateItem']);
    Route::delete('/{id}', [OrderController::class, 'removeItem']);
});

// ========== GASTOS (EXPENSES) ==========
Route::prefix('expenses')->group(function () {
    Route::get('/', [ExpenseController::class, 'index']);           // Listar gastos
    Route::get('/summary', [ExpenseController::class, 'summary']);  // Resumo do dia
    Route::get('/monthly-summary', [ExpenseController::class, 'monthlySummary']); // Resumo do mês
    Route::post('/', [ExpenseController::class, 'store']);          // Criar gasto
    Route::get('/{id}', [ExpenseController::class, 'show']);        // Mostrar gasto
    Route::put('/{id}', [ExpenseController::class, 'update']);      // Atualizar gasto
    Route::delete('/{id}', [ExpenseController::class, 'destroy']);  // Deletar gasto
});
