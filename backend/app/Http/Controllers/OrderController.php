<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Table;
use App\Models\Product;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    // 📋 LISTAR COMANDAS
    public function index(Request $request)
    {
        $restaurantId = $request->query('restaurant_id');

        $orders = Order::with('items.product')
            ->when($restaurantId, function ($query) use ($restaurantId) {
                $query->where('restaurant_id', $restaurantId);
            })
            ->get();

        return response()->json($orders);
    }

    // 🔍 MOSTRAR UMA COMANDA
    public function show($id)
    {
        $order = Order::with('items.product')->findOrFail($id);
        return response()->json($order);
    }

    // ➕ CRIAR COMANDA
    public function store(Request $request)
    {
        $data = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'table_id'      => 'required|exists:tables,id',
        ]);

        // 🔒 Valida mesa
        $table = Table::where('id', $data['table_id'])
            ->where('restaurant_id', $data['restaurant_id'])
            ->first();

        if (!$table) {
            return response()->json([
                'message' => 'Mesa não pertence ao restaurante'
            ], 400);
        }

        // 🚫 Verifica comanda aberta
        $orderOpen = Order::where('table_id', $data['table_id'])
            ->where('status', 'aberto')
            ->first();

        if ($orderOpen) {
            return response()->json([
                'message' => 'Já existe uma comanda aberta',
                'order' => $orderOpen
            ], 200);
        }

        $order = Order::create([
            'restaurant_id' => $data['restaurant_id'],
            'table_id'      => $data['table_id'],
            'status'        => 'aberto',
            'total'         => 0
        ]);

        return response()->json($order, 201);
    }

    // 🍟 ADICIONAR ITEM
    public function addItem(Request $request, $orderId)
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $order = Order::findOrFail($orderId);

        if ($order->status !== 'aberto') {
            return response()->json(['message' => 'Comanda não está aberta'], 400);
        }

        $product = Product::findOrFail($data['product_id']);

        // 🔒 garante que produto pertence ao restaurante
        if ($product->restaurant_id !== $order->restaurant_id) {
            return response()->json([
                'message' => 'Produto não pertence ao restaurante'
            ], 400);
        }

        $item = $order->items()
            ->where('product_id', $product->id)
            ->first();

        if ($item) {
            $item->increment('quantity');
        } else {
            $order->items()->create([
                'product_id' => $product->id,
                'quantity'   => 1,
                'price'      => $product->price,
            ]);
        }

        // 🔥 ATUALIZA TOTAL
        $this->updateTotal($order);

        return response()->json(['message' => 'Item adicionado']);
    }

    // ✏️ ATUALIZAR QUANTIDADE
    public function updateItem(Request $request, $itemId)
    {
        $data = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $item = OrderItem::findOrFail($itemId);

        $item->update([
            'quantity' => $data['quantity'],
        ]);

        $this->updateTotal($item->order);

        return response()->json($item);
    }

    // ❌ REMOVER ITEM
    public function removeItem($itemId)
    {
        $item = OrderItem::findOrFail($itemId);
        $order = $item->order;

        $item->delete();

        $this->updateTotal($order);

        return response()->json([
            'message' => 'Item removido'
        ]);
    }

    // 💰 FECHAR COMANDA
    public function close($id)
    {
        $order = Order::findOrFail($id);

        $order->update([
            'status' => 'finalizado'
        ]);

        return response()->json([
            'message' => 'Comanda finalizada'
        ]);
    }

    // ❌ DELETAR COMANDA
    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return response()->json([
            'message' => 'Comanda deletada'
        ]);
    }

    // 🔥 MÉTODO AUXILIAR
    private function updateTotal($order)
    {
        $total = $order->items()
            ->selectRaw('SUM(price * quantity) as total')
            ->value('total') ?? 0;

        $order->update([
            'total' => $total
        ]);
    }
}
