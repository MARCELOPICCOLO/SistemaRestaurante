<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // 📋 LISTAR
    public function index(Request $request)
    {
        $restaurantId = $request->query('restaurant_id');

        $categories = Category::when($restaurantId, function ($query) use ($restaurantId) {
            $query->where('restaurant_id', $restaurantId);
        })->get();

        return response()->json($categories);
    }

    // ➕ CRIAR
    public function store(Request $request)
    {
        $data = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'name' => 'required|string|max:255'
        ]);

        $category = Category::create($data);

        return response()->json($category, 201);
    }

    // 🔍 MOSTRAR UMA
    public function show($id)
    {
        $category = Category::with('products')->findOrFail($id);

        return response()->json($category);
    }

    // ✏️ ATUALIZAR
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255'
        ]);

        $category->update($data);

        return response()->json($category);
    }

    // ❌ DELETAR
    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json([
            'message' => 'Categoria deletada com sucesso'
        ]);
    }
}
