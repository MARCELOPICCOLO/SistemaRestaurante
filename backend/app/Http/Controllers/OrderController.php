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

    // ➕ CRIAR COMANDA
    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'restaurant_id' => 'required|exists:restaurants,id',
                'table_id'      => 'required|exists:tables,id',
                'customer_name' => 'nullable|string|max:100'
            ]);

            $table = \App\Models\Table::where('id', $data['table_id'])
                ->where('restaurant_id', $data['restaurant_id'])
                ->first();

            if (!$table) {
                return response()->json(['message' => 'Mesa não pertence ao restaurante'], 400);
            }

            $customerName = $data['customer_name'] ?? 'Cliente ' . (Order::where('table_id', $data['table_id'])->where('status', 'aberto')->count() + 1);

            $order = Order::create([
                'restaurant_id' => $data['restaurant_id'],
                'table_id'      => $data['table_id'],
                'customer_name' => $customerName,
                'status'        => 'aberto',
                'total'         => 0
            ]);

            return response()->json([
                'message' => 'Comanda criada com sucesso',
                'order' => $order
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Erro ao criar comanda: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao criar comanda',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 🍟 ADICIONAR ITEM
    public function addItem(Request $request, $orderId)
    {
        try {
            $data = $request->validate([
                'product_id' => 'required|exists:products,id',
            ]);

            $order = Order::findOrFail($orderId);

            if ($order->status !== 'aberto') {
                return response()->json(['message' => 'Comanda não está aberta'], 400);
            }

            $product = \App\Models\Product::findOrFail($data['product_id']);

            if ($product->restaurant_id !== $order->restaurant_id) {
                return response()->json(['message' => 'Produto não pertence ao restaurante'], 400);
            }

            $item = $order->items()->where('product_id', $product->id)->first();

            if ($item) {
                $item->increment('quantity');
                $orderItem = $item;
            } else {
                $orderItem = $order->items()->create([
                    'product_id' => $product->id,
                    'quantity'   => 1,
                    'price'      => $product->price,
                ]);
            }

            $this->updateTotal($order);

            // Retorna o item criado/atualizado com seu ID
            return response()->json([
                'message' => 'Item adicionado',
                'item' => $orderItem
            ], 200);
        } catch (\Exception $e) {
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
                return response()->json(['message' => 'Comanda já está finalizada'], 400);
            }

            $data = $request->validate([
                'payment_method' => 'required|string|in:dinheiro,pix,credito,debito',
                'total' => 'nullable|numeric|min:0'
            ]);

            // LOG PARA DEBUG
            \Log::info('Finalizando comanda:', [
                'order_id' => $id,
                'payment_method' => $data['payment_method'],
                'total' => $data['total'] ?? $order->total
            ]);

            $order->update([
                'status' => 'fechado',
                'closed_at' => now(),
                'payment_method' => $data['payment_method'], // ← VERIFIQUE ESTA LINHA
                'total' => $data['total'] ?? $order->total
            ]);

            return response()->json([
                'message' => 'Comanda finalizada com sucesso',
                'order' => $order
            ]);
        } catch (\Exception $e) {
            \Log::error('Erro ao finalizar comanda: ' . $e->getMessage());
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
}
