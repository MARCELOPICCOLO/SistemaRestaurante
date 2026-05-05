<?php

namespace App\Http\Controllers;

use App\Models\Table;
use Illuminate\Http\Request;

class TableController extends Controller
{
    // 📋 LISTAR MESAS
    public function index(Request $request)
    {
        $restaurantId = $request->query('restaurant_id');

        $tables = Table::when($restaurantId, function ($query) use ($restaurantId) {
            $query->where('restaurant_id', $restaurantId);
        })->get();

        return response()->json($tables);
    }

    // ➕ CRIAR MESA
    public function store(Request $request)
    {
        $data = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'number'        => 'required|integer',
            'active'        => 'boolean'
        ]);

        // 🔥 gera QR único
        $data['qr_code_hash'] = md5(uniqid());

        $table = Table::create($data);

        return response()->json($table, 201);
    }

    // 🔍 MOSTRAR UMA MESA
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
            'number' => 'sometimes|integer',
            'active' => 'sometimes|boolean'
        ]);

        $table->update($data);

        return response()->json($table);
    }

    // ❌ DELETAR MESA
    public function destroy($id)
    {
        $table = \App\Models\Table::with('orders')->findOrFail($id);

        if ($table->orders()->where('status', '!=', 'finalizado')->exists()) {
            return response()->json([
                'message' => 'Mesa possui pedidos em aberto'
            ], 400);
        }

        $table->delete();

        return response()->json([
            'message' => 'Mesa deletada com sucesso'
        ]);
    }
}
