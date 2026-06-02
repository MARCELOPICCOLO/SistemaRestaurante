<?php
// app/Http/Controllers/OrderController.php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    // 📋 LISTAR COMANDAS
    public function index(Request $request)
    {
        try {
            $query = Order::with('items.product');

            if ($request->has('restaurant_id')) {
                $query->where('restaurant_id', $request->restaurant_id);
            }

            $orders = $query->get();

            return response()->json($orders);
        } catch (\Exception $e) {
            \Log::error('Erro ao buscar orders: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao buscar comandas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 🔍 MOSTRAR UMA COMANDA
    public function show($id)
    {
        try {
            $order = Order::with('items.product')->findOrFail($id);
            return response()->json($order);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Comanda não encontrada'
            ], 404);
        }
    }

    // ➕ CRIAR COMANDA (ou importar venda)
    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'restaurant_id' => 'required|exists:restaurants,id',
                'table_id'      => 'required|exists:tables,id',
                'customer_name' => 'nullable|string|max:100',
                'status'        => 'nullable|string|in:aberto,fechado,pendente,cancelado',
                'total'         => 'nullable|numeric|min:0',
                'payment_method' => 'nullable|string|in:dinheiro,pix,credito,debito,pendente',
                'closed_at'     => 'nullable|date',
            ]);

            $table = \App\Models\Table::where('id', $data['table_id'])
                ->where('restaurant_id', $data['restaurant_id'])
                ->first();

            if (!$table) {
                return response()->json(['message' => 'Mesa não pertence ao restaurante'], 400);
            }

            // Define valores padrão
            $status = $data['status'] ?? 'fechado';
            $total = $data['total'] ?? 0;
            $customerName = $data['customer_name'] ?? 'Cliente Importado';
            $paymentMethod = $data['payment_method'] ?? null;
            $closedAt = $data['closed_at'] ?? ($status === 'fechado' ? now() : null);

            $order = Order::create([
                'restaurant_id' => $data['restaurant_id'],
                'table_id'      => $data['table_id'],
                'customer_name' => $customerName,
                'status'        => $status,
                'total'         => $total,
                'payment_method' => $paymentMethod,
                'closed_at'     => $closedAt,
            ]);

            return response()->json([
                'message' => 'Venda importada com sucesso',
                'order' => $order
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Erro ao criar venda: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao criar venda',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 🍟 ADICIONAR ITEM (CORRIGIDO - SEMPRE CRIA NOVO ITEM)
    public function addItem(Request $request, $orderId)
    {
        try {
            $request->validate([
                'product_id' => 'required|exists:products,id',
                'quantity' => 'sometimes|integer|min:1',
                'price' => 'sometimes|numeric|min:0'
            ]);

            $order = Order::findOrFail($orderId);

            // Verificar se a ordem está aberta
            if ($order->status !== 'aberto') {
                return response()->json(['message' => 'Esta venda já foi finalizada'], 400);
            }

            // SEMPRE CRIAR UM NOVO ITEM - NÃO AGRUPAR
            // Comente ou remova TODO o código que verifica se o produto já existe

            $orderItem = new OrderItem();
            $orderItem->order_id = $order->id;
            $orderItem->product_id = $request->product_id;
            $orderItem->quantity = $request->quantity ?? 1;

            // Usar o preço personalizado se fornecido, senão pegar do produto
            if ($request->has('price') && $request->price > 0) {
                $orderItem->price = $request->price;
            } else {
                $product = \App\Models\Product::findOrFail($request->product_id);
                $orderItem->price = $product->price;
            }

            $orderItem->save();

            // Atualizar o total da ordem
            $order->total = $order->items()->sum(\DB::raw('price * quantity'));
            $order->save();

            // Retornar o item recém-criado com o produto carregado
            $orderItem->load('product');

            return response()->json([
                'message' => 'Item adicionado com sucesso',
                'item' => $orderItem
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Erro ao adicionar item: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao adicionar item',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    // 📋 LISTAR ITENS DA COMANDA
    public function getItems($orderId)
    {
        try {
            $items = OrderItem::where('order_id', $orderId)
                ->with('product')
                ->get();

            return response()->json($items);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao buscar itens',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ✏️ ATUALIZAR QUANTIDADE
    public function updateItem(Request $request, $itemId)
    {
        try {
            $data = $request->validate([
                'quantity' => 'required|integer|min:1',
            ]);

            $item = OrderItem::findOrFail($itemId);
            $item->update(['quantity' => $data['quantity']]);

            $this->updateTotal($item->order);

            return response()->json([
                'message' => 'Item atualizado',
                'item' => $item
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao atualizar item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ❌ REMOVER ITEM
    public function removeItem($itemId)
    {
        try {
            $item = OrderItem::findOrFail($itemId);
            $order = $item->order;
            $item->delete();
            $this->updateTotal($order);

            return response()->json([
                'message' => 'Item removido com sucesso'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao remover item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 💰 FECHAR COMANDA (COM FORMA DE PAGAMENTO)

    public function close(Request $request, $id)
    {
        try {
            $order = Order::findOrFail($id);

            if ($order->status === 'fechado') {
                return response()->json([
                    'message' => 'Comanda já está finalizada'
                ], 400);
            }

            $data = $request->validate([
                'payment_method' => 'nullable|string|in:dinheiro,pix,credito,debito,pendente',
                'total' => 'nullable|numeric|min:0'
            ]);

            // Se for comanda não paga
            $status = $data['payment_method'] === 'pendente'
                ? 'pendente'
                : 'fechado';

            $order->update([
                'status' => $status,
                'closed_at' => now(),
                'payment_method' => $data['payment_method'] ?? null,
                'total' => $data['total'] ?? $order->total
            ]);

            return response()->json([
                'message' => $status === 'pendente'
                    ? 'Comanda marcada como não paga'
                    : 'Comanda finalizada com sucesso',

                'order' => $order
            ]);
        } catch (\Exception $e) {

            return response()->json([
                'message' => 'Erro ao finalizar comanda',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    // ❌ CANCELAR COMANDA
    public function destroy($id)
    {
        try {
            $order = Order::findOrFail($id);
            $order->update(['status' => 'cancelado']);

            return response()->json([
                'message' => 'Comanda cancelada com sucesso'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao cancelar comanda',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 📊 COMANDAS POR MESA
    public function getByTable($tableId)
    {
        try {
            $orders = Order::where('table_id', $tableId)
                ->where('status', 'aberto')
                ->with('items.product')
                ->orderBy('created_at', 'asc')
                ->get();

            return response()->json($orders);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao buscar comandas da mesa',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 🔥 MÉTODO AUXILIAR - ATUALIZAR TOTAL
    private function updateTotal($order)
    {
        $total = $order->items()
            ->selectRaw('SUM(price * quantity) as total')
            ->value('total') ?? 0;

        $order->update(['total' => $total]);
    }

    // app/Http/Controllers/OrderController.php

    public function salesSummary(Request $request)
    {
        try {
            $request->validate([
                'restaurant_id' => 'required|exists:restaurants,id',
                'date' => 'required|date',
            ]);

            $totalSales = Order::where('restaurant_id', $request->restaurant_id)
                ->where('status', 'fechado')
                ->whereDate('closed_at', $request->date)
                ->sum('total');

            $totalOrders = Order::where('restaurant_id', $request->restaurant_id)
                ->where('status', 'fechado')
                ->whereDate('closed_at', $request->date)
                ->count();

            return response()->json([
                'date' => $request->date,
                'total_sales' => (float) $totalSales,
                'total_orders' => $totalOrders,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao buscar resumo de vendas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
