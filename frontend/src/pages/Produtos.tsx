import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { TabelaProdutos } from "../../components/TabelaProdutos";
import { SidebarProdutos } from "../../components/SidebarProdutos";
import { ModalProduto } from "../../components/ModalProduto";
import { ModalCategorias } from "../../components/ModalCategorias";

interface Product {
  id: number;
  name: string;
  product_code: string;
  price: number;
  quantity: number;
  category_id: number;
  category?: {
    id: number;
    name: string;
  };
  active: boolean;
}

interface FormData {
  id?: number;
  name: string;
  product_code: string;
  price: number;
  quantity: number;
  category_id: number;
}

interface Category {
  id: number;
  name: string;
  restaurant_id: number;
}

export default function Produtos() {
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [showModalCategoria, setShowModalCategoria] = useState(false);
  const [editando, setEditando] = useState<Product | null>(null);
  const [editandoCategoria, setEditandoCategoria] = useState<Category | null>(
    null,
  );

  const [formData, setFormData] = useState<FormData>({
    name: "",
    product_code: "",
    price: 0,
    quantity: 0,
    category_id: 0,
  });

  const [novaCategoria, setNovaCategoria] = useState({ name: "" });

  const fetchProdutos = useCallback(async () => {
    setLoading(true);
    try {
      let url = "http://localhost:8000/api/products?restaurant_id=1";
      if (searchTerm) url += `&search=${searchTerm}`;
      const response = await fetch(url);
      const data = await response.json();
      const produtosFormatados = data.map((p: any) => ({
        ...p,
        price: typeof p.price === "number" ? p.price : Number(p.price) || 0,
        quantity:
          typeof p.quantity === "number" ? p.quantity : Number(p.quantity) || 0,
      }));
      setProdutos(produtosFormatados);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  const fetchCategorias = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/categories?restaurant_id=1",
      );
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  useEffect(() => {
    fetchProdutos();
    fetchCategorias();
  }, [fetchProdutos]);

  const formatCurrency = (value: any): string => {
    const num = typeof value === "number" ? value : Number(value);
    if (isNaN(num)) return "R$ 0,00";
    return `R$ ${num.toFixed(2).replace(".", ",")}`;
  };

  const salvarAlteracoesEstoque = async (
    alteracoes: { id: number; quantity: number }[],
  ) => {
    setLoading(true);
    let sucesso = 0;
    let erros = 0;

    for (const alteracao of alteracoes) {
      try {
        const produto = produtos.find((p) => p.id === alteracao.id);
        if (!produto) continue;

        const response = await fetch(
          `http://localhost:8000/api/products/${alteracao.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              restaurant_id: 1,
              name: produto.name,
              product_code: produto.product_code,
              price: produto.price,
              quantity: alteracao.quantity,
              category_id: produto.category_id,
              active: produto.active,
            }),
          },
        );

        if (response.ok) {
          sucesso++;
        } else {
          erros++;
        }
      } catch (error) {
        erros++;
        console.error("Erro ao atualizar estoque:", error);
      }
    }

    setLoading(false);

    if (sucesso > 0) {
      alert(
        `✅ ${sucesso} produto(s) atualizado(s) com sucesso!${erros > 0 ? `\n❌ ${erros} erro(s)` : ""}`,
      );
      fetchProdutos();
    } else if (erros > 0) {
      alert("❌ Erro ao atualizar os produtos. Tente novamente.");
    }
  };

  const salvarProduto = async () => {
    if (!formData.name || !formData.category_id) {
      alert("Preencha nome e categoria");
      return;
    }

    try {
      const url = editando
        ? `http://localhost:8000/api/products/${editando.id}`
        : "http://localhost:8000/api/products";
      const method = editando ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          restaurant_id: 1,
          name: formData.name,
          product_code: formData.product_code || null,
          price: Number(formData.price),
          quantity: Number(formData.quantity),
          category_id: Number(formData.category_id),
          active: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.message || "Erro ao salvar produto");
        return;
      }

      setShowModal(false);
      setEditando(null);
      setFormData({
        name: "",
        product_code: "",
        price: 0,
        quantity: 0,
        category_id: 0,
      });
      fetchProdutos();
      alert(editando ? "Produto atualizado!" : "Produto adicionado!");
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert("Erro ao conectar com o servidor");
    }
  };

  const adicionarCategoria = async () => {
    if (!novaCategoria.name.trim()) {
      alert("Digite o nome da categoria");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ restaurant_id: 1, name: novaCategoria.name }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.message || "Erro ao criar categoria");
        return;
      }

      await fetchCategorias();
      setShowModalCategoria(false);
      setNovaCategoria({ name: "" });
      alert("Categoria adicionada com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      alert("Erro ao conectar com o servidor");
    }
  };

  const editarCategoria = async () => {
    if (!editandoCategoria) return;
    if (!editandoCategoria.name.trim()) {
      alert("Digite o nome da categoria");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/categories/${editandoCategoria.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ name: editandoCategoria.name }),
        },
      );

      if (!response.ok) {
        alert("Erro ao editar categoria");
        return;
      }

      await fetchCategorias();
      setEditandoCategoria(null);
      alert("Categoria atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao editar categoria:", error);
      alert("Erro ao conectar com o servidor");
    }
  };

  const excluirCategoria = async (id: number, name: string) => {
    const temProdutos = produtos.some((p) => p.category_id === id);

    if (temProdutos) {
      if (
        !confirm(
          `A categoria "${name}" possui produtos associados. Excluir mesmo assim?`,
        )
      )
        return;
    } else {
      if (!confirm(`Tem certeza que deseja excluir a categoria "${name}"?`))
        return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/categories/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        alert("Erro ao excluir categoria");
        return;
      }

      await fetchCategorias();
      if (categoriaFiltro === id) setCategoriaFiltro(null);
      alert("Categoria excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      alert("Erro ao conectar com o servidor");
    }
  };

  const removerProduto = async (id: number, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${name}"?`)) return;

    try {
      const response = await fetch(`http://localhost:8000/api/products/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        alert("Erro ao excluir produto");
        return;
      }

      fetchProdutos();
      alert("Produto excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      alert("Erro ao conectar com o servidor");
    }
  };

  const abrirModalEditar = (produto: Product) => {
    setEditando(produto);
    setFormData({
      id: produto.id,
      name: produto.name,
      product_code: produto.product_code || "",
      price: produto.price,
      quantity: produto.quantity,
      category_id: produto.category_id,
    });
    setShowModal(true);
  };

  const produtosFiltrados = produtos.filter((p) => {
    if (categoriaFiltro) return p.category_id === categoriaFiltro;
    return true;
  });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        height: "100%",
        background: "#FAFAFA",
      }}
    >
      <SidebarProdutos
        onNovoProduto={() => {
          setEditando(null);
          setFormData({
            name: "",
            product_code: "",
            price: 0,
            quantity: 0,
            category_id: 0,
          });
          setShowModal(true);
        }}
        onCategorias={() => setShowModalCategoria(true)}
        totalProdutos={produtos.length}
      />

      <div style={{ padding: "20px", overflowY: "auto", height: "100vh" }}>
        <div
          style={{
            background: "#fff",
            padding: "16px 20px",
            borderRadius: 8,
            marginBottom: 20,
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
              Lista de Produtos
            </h2>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ position: "relative" }}>
                <FontAwesomeIcon
                  icon={faSearch}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 12,
                    color: "#9ca3af",
                  }}
                />
                <input
                  type="text"
                  placeholder="Buscar por nome ou código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: "8px 12px 8px 32px",
                    borderRadius: 6,
                    border: "1px solid #e5e7eb",
                    fontSize: 13,
                    width: 220,
                    outline: "none",
                  }}
                />
              </div>
              <select
                value={categoriaFiltro || ""}
                onChange={(e) =>
                  setCategoriaFiltro(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <option value="">Todas categorias</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <TabelaProdutos
          produtos={produtosFiltrados}
          loading={loading}
          formatCurrency={formatCurrency}
          abrirModalEditar={abrirModalEditar}
          removerProduto={removerProduto}
          salvarAlteracoesEstoque={salvarAlteracoesEstoque}
        />
      </div>

      <ModalProduto
        showModal={showModal}
        setShowModal={setShowModal}
        editando={!!editando}
        formData={formData}
        setFormData={setFormData}
        categorias={categorias}
        salvarProduto={salvarProduto}
        produtosExistentes={produtos.map((p) => ({
          id: p.id,
          product_code: p.product_code,
        }))}
      />

      <ModalCategorias
        showModalCategoria={showModalCategoria}
        setShowModalCategoria={setShowModalCategoria}
        categorias={categorias}
        editandoCategoria={editandoCategoria}
        setEditandoCategoria={setEditandoCategoria}
        novaCategoria={novaCategoria}
        setNovaCategoria={setNovaCategoria}
        adicionarCategoria={adicionarCategoria}
        editarCategoria={editarCategoria}
        excluirCategoria={excluirCategoria}
      />
    </div>
  );
}
