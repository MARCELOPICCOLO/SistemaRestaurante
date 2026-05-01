<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // 📋 LISTAR PRODUTOS
    public function index(Request $request)
    {
        $restaurantId = $request->query('restaurant_id');

        $products = Product::with('category')
            ->when($restaurantId, function ($query) use ($restaurantId) {
                $query->where('restaurant_id', $restaurantId);
            })
            ->get();

        return response()->json($products);
    }

    // ➕ CRIAR PRODUTO
    public function store(Request $request)
    {
        $data = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'category_id'   => 'required|exists:categories,id',
            'name'          => 'required|string|max:255',
            'description'   => 'nullable|string',
            'price'         => 'required|numeric|min:0',
            'active'        => 'boolean'
        ]);

        $product = Product::create($data);

        return response()->json($product, 201);
    }

    // 🔍 MOSTRAR UM PRODUTO
    public function show($id)
    {
        $product = Product::with('category')->findOrFail($id);

        return response()->json($product);
    }

    // ✏️ ATUALIZAR PRODUTO
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $data = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name'        => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price'       => 'sometimes|numeric|min:0',
            'active'      => 'sometimes|boolean'
        ]);

        $product->update($data);

        return response()->json($product);
    }

    // ❌ DELETAR PRODUTO
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'message' => 'Produto deletado com sucesso'
        ]);
    }
}
