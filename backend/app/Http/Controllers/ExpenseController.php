<?php
// app/Http/Controllers/ExpenseController.php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        try {
            $request->validate([
                'restaurant_id' => 'required|exists:restaurants,id',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'category' => 'nullable|string', // Remove the in: constraint
            ]);

            $query = Expense::where('restaurant_id', $request->restaurant_id);

            if ($request->has('start_date')) {
                $query->whereDate('expense_date', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->whereDate('expense_date', '<=', $request->end_date);
            }
            if ($request->has('category')) {
                $query->where('category', $request->category);
            }

            $expenses = $query->orderBy('expense_date', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($expenses);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao buscar gastos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'restaurant_id' => 'required|exists:restaurants,id',
                'description' => 'required|string|max:255',
                'amount' => 'required|numeric|min:0.01',
                'expense_date' => 'required|date',
                'category' => 'nullable|string|max:50',
                'notes' => 'nullable|string',
            ]);

            $expense = Expense::create($data);

            return response()->json([
                'message' => 'Gasto lançado com sucesso',
                'expense' => $expense
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao criar gasto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $expense = Expense::findOrFail($id);
            return response()->json($expense);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gasto não encontrado'
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $expense = Expense::findOrFail($id);

            $data = $request->validate([
                'description' => 'sometimes|string|max:255',
                'amount' => 'sometimes|numeric|min:0.01',
                'expense_date' => 'sometimes|date',
                'category' => 'nullable|string|max:50',
                'notes' => 'nullable|string',
            ]);

            $expense->update($data);

            return response()->json([
                'message' => 'Gasto atualizado com sucesso',
                'expense' => $expense
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao atualizar gasto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $expense = Expense::findOrFail($id);
            $expense->delete();

            return response()->json([
                'message' => 'Gasto removido com sucesso'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao remover gasto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function summary(Request $request)
    {
        try {
            $request->validate([
                'restaurant_id' => 'required|exists:restaurants,id',
                'date' => 'required|date',
            ]);

            $totalExpenses = Expense::where('restaurant_id', $request->restaurant_id)
                ->whereDate('expense_date', $request->date)
                ->sum('amount');

            $expensesByCategory = Expense::where('restaurant_id', $request->restaurant_id)
                ->whereDate('expense_date', $request->date)
                ->select('category', DB::raw('SUM(amount) as total'))
                ->groupBy('category')
                ->get();

            return response()->json([
                'date' => $request->date,
                'total_expenses' => $totalExpenses,
                'expenses_by_category' => $expensesByCategory,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao buscar resumo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function monthlySummary(Request $request)
    {
        try {
            $request->validate([
                'restaurant_id' => 'required|exists:restaurants,id',
                'year' => 'required|integer|min:2020|max:2030',
                'month' => 'required|integer|min:1|max:12',
            ]);

            $startDate = date("{$request->year}-{$request->month}-01");
            $endDate = date("{$request->year}-{$request->month}-t");

            $expenses = Expense::where('restaurant_id', $request->restaurant_id)
                ->whereBetween('expense_date', [$startDate, $endDate])
                ->select('category', DB::raw('SUM(amount) as total'))
                ->groupBy('category')
                ->get();

            $total = $expenses->sum('total');

            return response()->json([
                'year' => $request->year,
                'month' => $request->month,
                'total_expenses' => $total,
                'expenses_by_category' => $expenses,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao buscar resumo mensal',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
