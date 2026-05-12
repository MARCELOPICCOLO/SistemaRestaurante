<?php
// app/Http/Controllers/ExpenseCategoryController.php

namespace App\Http\Controllers;

use App\Models\ExpenseCategory;
use Illuminate\Http\Request;

class ExpenseCategoryController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id'
        ]);

        $categories = ExpenseCategory::where('restaurant_id', $request->restaurant_id)
            ->orderBy('name')
            ->get();

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'name' => 'required|string|max:100',
            'icon' => 'nullable|string|max:10',
            'color' => 'nullable|string|max:20',
        ]);

        $category = ExpenseCategory::create([
            'restaurant_id' => $data['restaurant_id'],
            'name' => $data['name'],
            'icon' => $data['icon'] ?? '📌',
            'color' => $data['color'] ?? '#6b7280',
            'is_active' => true
        ]);

        return response()->json($category, 201);
    }

    public function update(Request $request, $id)
    {
        $category = ExpenseCategory::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string|max:100',
            'icon' => 'nullable|string|max:10',
            'color' => 'nullable|string|max:20',
            'is_active' => 'sometimes|boolean'
        ]);

        $category->update($data);

        return response()->json($category);
    }

    public function destroy($id)
    {
        $category = ExpenseCategory::findOrFail($id);

        // Verificar se tem gastos associados
        if ($category->expenses()->count() > 0) {
            return response()->json([
                'message' => 'Não é possível excluir categoria com gastos associados'
            ], 409);
        }

        $category->delete();

        return response()->json(['message' => 'Categoria excluída com sucesso']);
    }
}
