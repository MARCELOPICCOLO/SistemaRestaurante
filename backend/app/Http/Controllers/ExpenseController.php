<?php
// app/Http/Controllers/ExpenseController.php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExpenseController extends Controller
{
    /**
     * 📋 LISTAR GASTOS
     */
    public function index(Request $request)
    {
        $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'category' => 'nullable|string|in:' . implode(',', array_keys(Expense::CATEGORIES)),
        ]);

        $query = Expense::where('restaurant_id', $request->restaurant_id);

        // Filtro por período
        if ($request->has('start_date')) {
            $query->whereDate('expense_date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('expense_date', '<=', $request->end_date);
        }

        // Filtro por categoria
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $expenses = $query->orderBy('expense_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($expenses);
    }

    /**
     * 📊 RESUMO DO DIA
     */
    public function summary(Request $request)
    {
        $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'date' => 'required|date',
        ]);

        $date = $request->date;

        // Total de gastos do dia
        $totalExpenses = Expense::where('restaurant_id', $request->restaurant_id)
            ->whereDate('expense_date', $date)
            ->sum('amount');

        // Total por categoria
        $expensesByCategory = Expense::where('restaurant_id', $request->restaurant_id)
            ->whereDate('expense_date', $date)
            ->select('category', DB::raw('SUM(amount) as total'))
            ->groupBy('category')
            ->get();

        return response()->json([
            'date' => $date,
            'total_expenses' => $totalExpenses,
            'expenses_by_category' => $expensesByCategory,
        ]);
    }

    /**
     * 📊 RESUMO DO MÊS
     */
    public function monthlySummary(Request $request)
    {
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
    }

    /**
     * 📥 CRIAR GASTO
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'expense_date' => 'required|date',
            'category' => 'required|string|in:' . implode(',', array_keys(Expense::CATEGORIES)),
            'notes' => 'nullable|string',
        ]);

        $expense = Expense::create($data);

        return response()->json([
            'message' => 'Gasto lançado com sucesso',
            'expense' => $expense
        ], 201);
    }

    /**
     * 🔍 MOSTRAR GASTO
     */
    public function show($id)
    {
        $expense = Expense::findOrFail($id);
        return response()->json($expense);
    }

    /**
     * ✏️ ATUALIZAR GASTO
     */
    public function update(Request $request, $id)
    {
        $expense = Expense::findOrFail($id);

        $data = $request->validate([
            'description' => 'sometimes|string|max:255',
            'amount' => 'sometimes|numeric|min:0.01',
            'expense_date' => 'sometimes|date',
            'category' => 'sometimes|string|in:' . implode(',', array_keys(Expense::CATEGORIES)),
            'notes' => 'nullable|string',
        ]);

        $expense->update($data);

        return response()->json([
            'message' => 'Gasto atualizado com sucesso',
            'expense' => $expense
        ]);
    }

    /**
     * ❌ DELETAR GASTO
     */
    public function destroy($id)
    {
        $expense = Expense::findOrFail($id);
        $expense->delete();

        return response()->json([
            'message' => 'Gasto removido com sucesso'
        ]);
    }
}
