<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // 📋 LISTAR PRODUTOS (COM BUSCA POR NOME OU CÓDIGO)
    public function index(Request $request)
    {
        // Pega o restaurant_id da query string
        $restaurantId = $request->query('restaurant_id');

        // Validação manual (mais simples)
        if (!$restaurantId) {
            return response()->json([
                'message' => 'restaurant_id é obrigatório'
            ], 400);
        }

        // Verifica se o restaurante existe
        $restaurantExists = \App\Models\Restaurant::where('id', $restaurantId)->exists();
        if (!$restaurantExists) {
            return response()->json([
                'message' => 'Restaurante não encontrado'
            ], 404);
        }

        $search = $request->query('search');

        $query = Product::with('category')
            ->where('restaurant_id', $restaurantId);

        // Se tiver termo de busca, procura por nome OU código
        if ($search && !empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('product_code', 'LIKE', "%{$search}%");
            });
        }

        $products = $query->orderBy('name')->get();

        return response()->json($products);
    }

    // ... resto dos métodos
}
