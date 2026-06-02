<?php
// app/Http/Controllers/ExpenseController.php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\ExpenseCategory;
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
                'category_id' => 'nullable|integer',
            ]);

            $query = Expense::where('restaurant_id', $request->restaurant_id)
                ->with('category'); // Carregar a categoria relacionada

            if ($request->has('start_date')) {
                $query->whereDate('expense_date', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->whereDate('expense_date', '<=', $request->end_date);
            }
            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
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
                'category_id' => 'required|exists:expense_categories,id', // Mudado de category para category_id
                'notes' => 'nullable|string',
            ]);

            $expense = Expense::create([
                'restaurant_id' => $data['restaurant_id'],
                'description' => $data['description'],
                'amount' => $data['amount'],
                'expense_date' => $data['expense_date'],
                'category_id' => $data['category_id'], // Usando category_id
                'notes' => $data['notes'],
            ]);

            // Carregar a categoria relacionada para retornar
            $expense->load('category');

            return response()->json([
                'message' => 'Gasto lançado com sucesso',
                'expense' => $expense
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $e->errors()
            ], 422);
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
            $expense = Expense::with('category')->findOrFail($id);
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
                'category_id' => 'sometimes|exists:expense_categories,id', // Mudado de category para category_id
                'notes' => 'nullable|string',
            ]);

            $expense->update($data);
            $expense->load('category');

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
                ->with('category')
                ->select('category_id', DB::raw('SUM(amount) as total'))
                ->groupBy('category_id')
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
                ->with('category')
                ->select('category_id', DB::raw('SUM(amount) as total'))
                ->groupBy('category_id')
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

    public function importCsv(Request $request)
    {
        try {
            $request->validate([
                'restaurant_id' => 'required|exists:restaurants,id',
                'file' => 'required|file|mimes:csv,txt',
                'category_id' => 'required|exists:expense_categories,id',
            ]);

            $file = $request->file('file');
            $handle = fopen($file->getPathname(), 'r');

            // Ler cabeçalho
            $header = fgetcsv($handle, 0, ';');

            $imported = 0;
            $errors = [];

            while (($row = fgetcsv($handle, 0, ';')) !== false) {
                try {
                    $data = array_combine($header, $row);

                    // Converter data de DD/MM/YYYY para YYYY-MM-DD
                    $dateParts = explode('/', $data['Data']);
                    $formattedDate = "{$dateParts[2]}-{$dateParts[1]}-{$dateParts[0]}";

                    // Converter valor (substituir vírgula por ponto)
                    $amount = str_replace(',', '.', $data['Valor']);

                    Expense::create([
                        'restaurant_id' => $request->restaurant_id,
                        'description' => $data['Descrição'],
                        'amount' => (float) $amount,
                        'expense_date' => $formattedDate,
                        'category_id' => $request->category_id,
                        'notes' => null,
                    ]);

                    $imported++;
                } catch (\Exception $e) {
                    $errors[] = "Erro na linha " . ($imported + 2) . ": " . $e->getMessage();
                }
            }

            fclose($handle);

            return response()->json([
                'message' => "Importação concluída",
                'imported' => $imported,
                'errors' => $errors
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro na importação',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
