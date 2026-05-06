<?php
// app/Http/Controllers/TableController.php

namespace App\Http\Controllers;

use App\Models\Table;
use Illuminate\Http\Request;

class TableController extends Controller
{
    // 📋 LISTAR MESAS
    public function index(Request $request)
    {
        $restaurantId = $request->query('restaurant_id');

        $tables = Table::where('restaurant_id', $restaurantId)
            ->orderBy('number', 'asc')
            ->get();

        return response()->json($tables);
    }

    // ➕ CRIAR MESA
    public function store(Request $request)
    {
        $data = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'number' => 'required|integer|min:1'
        ]);

        // ✅ VERIFICAR SE JÁ EXISTE MESA COM ESTE NÚMERO
        $existingTable = Table::where('restaurant_id', $data['restaurant_id'])
            ->where('number', $data['number'])
            ->first();

        if ($existingTable) {
            return response()->json([
                'message' => 'Já existe uma mesa com o número ' . $data['number'] . ' neste restaurante'
            ], 409); // 409 Conflict
        }

        $table = Table::create($data);

        return response()->json($table, 201);
    }

    // 🔍 MOSTRAR MESA
    public function show($id)
    {
        $table = Table::findOrFail($id);
        return response()->json($table);
    }

    // ✏️ ATUALIZAR MESA
    public function update(Request $request, $id)
    {
        $table = Table::findOrFail($id);

        $data = $request->validate([
            'number' => 'sometimes|integer|min:1'
        ]);

        // ✅ VERIFICAR SE OUTRA MESA JÁ TEM ESTE NÚMERO
        if (isset($data['number'])) {
            $existingTable = Table::where('restaurant_id', $table->restaurant_id)
                ->where('number', $data['number'])
                ->where('id', '!=', $id)
                ->first();

            if ($existingTable) {
                return response()->json([
                    'message' => 'Já existe uma mesa com o número ' . $data['number'] . ' neste restaurante'
                ], 409);
            }
        }

        $table->update($data);
        return response()->json($table);
    }

    // ❌ DELETAR MESA
    public function destroy($id)
    {
        $table = Table::findOrFail($id);

        // Verificar se a mesa tem comandas abertas
        $hasOpenOrders = $table->orders()->where('status', 'aberto')->exists();

        if ($hasOpenOrders) {
            return response()->json([
                'message' => 'Não é possível excluir a mesa pois ela possui comandas abertas'
            ], 409);
        }

        $table->delete();

        return response()->json([
            'message' => 'Mesa deletada com sucesso'
        ]);
    }
}
