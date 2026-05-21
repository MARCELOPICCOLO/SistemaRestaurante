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
        try {
            $validated = $request->validate([
                'restaurant_id' => 'required|integer|exists:restaurants,id',
                'number' => 'required|integer|min:0'
            ]);

            // Verificar se já existe mesa com este número
            $existingTable = Table::where('restaurant_id', $validated['restaurant_id'])
                ->where('number', $validated['number'])
                ->first();

            if ($existingTable) {
                return response()->json([
                    'message' => "Já existe um ponto de venda com o número {$validated['number']}"
                ], 409);
            }

            // Criar a mesa
            $table = Table::create([
                'restaurant_id' => $validated['restaurant_id'],
                'number' => $validated['number'],
                'qr_code_hash' => null // ou pode gerar um hash se quiser
            ]);

            return response()->json($table, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao criar ponto de venda',
                'error' => $e->getMessage()
            ], 500);
        }
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

        try {
            $validated = $request->validate([
                'number' => 'sometimes|integer|min:0'
            ]);

            if (isset($validated['number'])) {
                // Verificar se o novo número já existe
                $existingTable = Table::where('restaurant_id', $table->restaurant_id)
                    ->where('number', $validated['number'])
                    ->where('id', '!=', $table->id)
                    ->first();

                if ($existingTable) {
                    return response()->json([
                        'message' => "Já existe um ponto de venda com o número {$validated['number']}"
                    ], 409);
                }

                $table->number = $validated['number'];
            }

            $table->save();

            return response()->json($table);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao atualizar ponto de venda',
                'error' => $e->getMessage()
            ], 500);
        }
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
