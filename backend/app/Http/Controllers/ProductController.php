<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // 📋 LISTAR PRODUTOS (COM BUSCA POR NOME OU CÓDIGO)
    public function index(Request $request)
    {
        try {
            // Pega o restaurant_id da query string
            $restaurantId = $request->query('restaurant_id');

            // Validação manual
            if (!$restaurantId) {
                return response()->json([
                    'message' => 'restaurant_id é obrigatório'
                ], 400);
            }

            // Verifica se o restaurante existe
            $restaurantExists = \App\Models\Restaurant::where('id', $restaurantId)->exists();
            if (!$restaurantExists) {
                return response()->json([
                    'message' => 'Restaurante não encontrado'
                ], 404);
            }

            $search = $request->query('search');

            $query = Product::with('category')
                ->where('restaurant_id', $restaurantId);

            // Se tiver termo de busca, procura por nome OU código
            if ($search && !empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                        ->orWhere('product_code', 'LIKE', "%{$search}%");
                });
            }

            $products = $query->orderBy('name')->get();

            // Garantir que os campos existam na resposta
            $formattedProducts = $products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'product_code' => $product->product_code,
                    'price' => (float) $product->price,
                    'quantity' => $product->quantity ?? 0,
                    'category_id' => $product->category_id,
                    'category' => $product->category,
                    'active' => $product->active ?? true,
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                ];
            });

            return response()->json($formattedProducts);
        } catch (\Exception $e) {
            \Log::error('Erro ao buscar produtos: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao buscar produtos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 🔍 BUSCAR PRODUTO POR CÓDIGO
    public function findByCode(Request $request, $code)
    {
        try {
            $restaurantId = $request->query('restaurant_id');

            if (!$restaurantId) {
                return response()->json([
                    'message' => 'restaurant_id é obrigatório'
                ], 400);
            }

            $product = Product::where('restaurant_id', $restaurantId)
                ->where('product_code', $code)
                ->with('category')
                ->first();

            if (!$product) {
                return response()->json([
                    'message' => 'Produto não encontrado com o código informado'
                ], 404);
            }

            return response()->json($product);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao buscar produto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 🔍 MOSTRAR UM PRODUTO
    public function show($id)
    {
        try {
            $product = Product::with('category')->findOrFail($id);

            // Garantir que quantity existe
            $product->quantity = $product->quantity ?? 0;

            return response()->json($product);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Produto não encontrado'
            ], 404);
        }
    }

    // ➕ CRIAR PRODUTO

    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'restaurant_id' => 'required|exists:restaurants,id',
                'category_id'   => 'required|exists:categories,id',
                'name'          => 'required|string|max:255',
                'product_code'  => 'nullable|string|max:50',
                'price'         => 'required|numeric|min:0',
                'quantity'      => 'required|integer|min:0',  // ← GARANTA QUE ESTÁ AQUI
                'active'        => 'boolean'
            ]);

            // Log para debug
            \Log::info('Criando produto:', $data);

            // Se não informar código, gera um automático
            if (empty($data['product_code'])) {
                $lastProduct = Product::where('restaurant_id', $data['restaurant_id'])
                    ->orderBy('id', 'desc')
                    ->first();
                $nextId = ($lastProduct ? $lastProduct->id + 1 : 1);
                $data['product_code'] = 'PROD-' . str_pad($nextId, 5, '0', STR_PAD_LEFT);
            }

            $product = Product::create($data);
            $product->load('category');

            return response()->json($product, 201);
        } catch (\Exception $e) {
            \Log::error('Erro ao criar produto: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao criar produto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ✏️ ATUALIZAR PRODUTO
    // app/Http/Controllers/ProductController.php

    public function update(Request $request, $id)
    {
        try {
            $product = Product::findOrFail($id);

            $data = $request->validate([
                'category_id'   => 'sometimes|exists:categories,id',
                'name'          => 'sometimes|string|max:255',
                'product_code'  => 'nullable|string|max:50|unique:products,product_code,' . $id . ',id,restaurant_id,' . $product->restaurant_id,
                'price'         => 'sometimes|numeric|min:0',
                'quantity'      => 'sometimes|integer|min:0',
                'active'        => 'sometimes|boolean'
            ]);

            $product->update($data);
            $product->load('category');

            return response()->json($product);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao atualizar produto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 📊 ATUALIZAR ESTOQUE
    public function updateStock(Request $request, $id)
    {
        try {
            $product = Product::findOrFail($id);

            $data = $request->validate([
                'quantity' => 'required|integer|min:0',
            ]);

            $product->update(['quantity' => $data['quantity']]);

            return response()->json([
                'message' => 'Estoque atualizado com sucesso',
                'product' => $product
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao atualizar estoque',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ❌ DELETAR PRODUTO
    public function destroy($id)
    {
        try {
            $product = Product::findOrFail($id);

            // Verificar se o produto está sendo usado em alguma comanda (opcional)
            // if ($product->orderItems()->exists()) {
            //     return response()->json([
            //         'message' => 'Não é possível excluir o produto pois ele está vinculado a comandas'
            //     ], 409);
            // }

            $product->delete();

            return response()->json([
                'message' => 'Produto deletado com sucesso'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao deletar produto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Adicione um método para atualizar múltiplos produtos de uma vez
    public function bulkUpdateStock(Request $request)
    {
        try {
            $data = $request->validate([
                'restaurant_id' => 'required|exists:restaurants,id',
                'products' => 'required|array',
                'products.*.id' => 'required|exists:products,id',
                'products.*.quantity' => 'required|integer|min:0',
            ]);

            $updated = [];
            foreach ($data['products'] as $item) {
                $product = Product::where('restaurant_id', $data['restaurant_id'])
                    ->where('id', $item['id'])
                    ->first();

                if ($product) {
                    $product->update(['quantity' => $item['quantity']]);
                    $updated[] = $product;
                }
            }

            return response()->json([
                'message' => count($updated) . ' produtos atualizados',
                'products' => $updated
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao atualizar estoque',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
