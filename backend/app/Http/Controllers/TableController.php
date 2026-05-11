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
        // ... seu código
    }

    // 🔍 MOSTRAR MESA (parâmetro $table)
    public function show($table)
    {
        $table = Table::findOrFail($table);
        return response()->json($table);
    }

    // ✏️ ATUALIZAR MESA (parâmetro $table)
    public function update(Request $request, $table)
    {
        $table = Table::findOrFail($table);
        // ... seu código
    }

    // ❌ DELETAR MESA (parâmetro $table)
    public function destroy($table)
    {
        try {
            $table = Table::findOrFail($table);

            // Impedir exclusão da mesa balcão
            if ($table->number === 0) {
                return response()->json([
                    'message' => 'A mesa do balcão não pode ser excluída'
                ], 409);
            }

            // Verificar se tem comandas abertas
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
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao deletar mesa',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
