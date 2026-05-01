<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
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
            'table_name'    => 'required|string|max:50',
        ]);

        $order = Order::create([
            'restaurant_id' => $data['restaurant_id'],
            'table_name'    => $data['table_name'],
            'status'        => 'open',
        ]);

        return response()->json($order, 201);
    }

    // 🍟 ADICIONAR ITEM
    public function addItem(Request $request, $orderId)
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'price'      => 'required|numeric|min:0',
        ]);

        $order = Order::findOrFail($orderId);

        if ($order->status !== 'open') {
            return response()->json(['message' => 'Comanda fechada'], 400);
        }

        $item = $order->items()
            ->where('product_id', $data['product_id'])
            ->first();

        if ($item) {
            $item->increment('quantity');
        } else {
            $order->items()->create([
                'product_id' => $data['product_id'],
                'quantity'   => 1,
                'price'      => $data['price'],
            ]);
        }

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

        return response()->json($item);
    }

    // ❌ REMOVER ITEM
    public function removeItem($itemId)
    {
        $item = OrderItem::findOrFail($itemId);
        $item->delete();

        return response()->json([
            'message' => 'Item removido'
        ]);
    }

    // 💰 FECHAR COMANDA
    public function close($id)
    {
        $order = Order::findOrFail($id);

        $order->update([
            'status' => 'closed'
        ]);

        return response()->json([
            'message' => 'Comanda fechada'
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
}
