// pages/GestaoVendas.tsx
import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SidebarVendas } from "../../components/SidebarVendas";
import { TabelaProdutosPdv } from "../../components/TabelaProdutosPdv";
import {
  faArrowLeft,
  faPlus,
  faTimes,
  faCashRegister,
  faCheck,
  faTrash,
  faShoppingCart,
  faBars,
  faBoxes,
  faClipboardList,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";

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

interface Category {
  id: number;
  name: string;
  restaurant_id: number;
}

interface PontoVenda {
  id: number;
  number: number;
  restaurant_id: number;
}

interface VendaItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: {
    name: string;
    product_code?: string;
  };
}

interface Venda {
  id: number;
  customer_name: string;
  status: string;
  total?: number;
  items?: VendaItem[];
  created_at?: string;
  table_id?: number;
}

interface GestaoVendasProps {
  setTela?: (tela: string) => void;
}

export default function GestaoVendas({ setTela }: GestaoVendasProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<"produtos" | "comandas">("produtos");

  // Estados para produtos
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [categorias, setCategorias] = useState<Category[]>([]);

  // Estados para vendas
  const [pontosVenda, setPontosVenda] = useState<PontoVenda[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);
  const [filtroVenda, setFiltroVenda] = useState<
    "todas" | "abertas" | "fechadas"
  >("abertas");
  const [showModalNovaVenda, setShowModalNovaVenda] = useState(false);
  const [pontoSelecionado, setPontoSelecionado] = useState<number>(0);
  const [novoCliente, setNovoCliente] = useState("");
  const [showModalFecharVenda, setShowModalFecharVenda] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [showFiltroData, setShowFiltroData] = useState(false);

  // Detectar mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Buscar pontos de venda
  const fetchPontosVenda = useCallback(async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/tables?restaurant_id=1",
      );
      const data = await response.json();
      setPontosVenda(data);
      if (data.length > 0) {
        setPontoSelecionado(data[0].id);
      }
    } catch (error) {
      console.error("Erro ao buscar pontos de venda:", error);
    }
  }, []);

  // Buscar produtos
  const fetchProdutos = useCallback(async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/products?restaurant_id=1",
      );
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
    }
  }, []);

  // Buscar categorias
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

  // Buscar vendas
  const fetchVendas = useCallback(async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/orders?restaurant_id=1",
      );
      const data = await response.json();
      const vendasComTotal = data.map((venda: any) => ({
        ...venda,
        total:
          venda.items?.reduce(
            (sum: number, item: any) =>
              sum + Number(item.price) * item.quantity,
            0,
          ) || 0,
      }));
      setVendas(vendasComTotal);
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    }
  }, []);

  useEffect(() => {
    fetchProdutos();
    fetchCategorias();
    fetchPontosVenda();
    fetchVendas();
  }, [fetchProdutos, fetchVendas, fetchPontosVenda]);

  // Filtrar vendas por data e status
  const vendasFiltradas = vendas.filter((venda) => {
    if (filtroVenda === "abertas" && venda.status !== "aberto") return false;
    if (filtroVenda === "fechadas" && venda.status !== "fechado") return false;
    if (dataInicio || dataFim) {
      const dataVenda = venda.created_at
        ? new Date(venda.created_at).toISOString().split("T")[0]
        : "";
      if (dataInicio && dataVenda < dataInicio) return false;
      if (dataFim && dataVenda > dataFim) return false;
    }
    return true;
  });

  // Abrir nova venda
  const abrirVenda = async () => {
    if (!pontoSelecionado) {
      alert("Selecione um ponto de venda");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          restaurant_id: 1,
          table_id: pontoSelecionado,
          customer_name:
            novoCliente.trim() || `Cliente ${new Date().toLocaleTimeString()}`,
          status: "aberto",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.message || "Erro ao abrir venda");
        return;
      }

      const data = await response.json();
      const novaVenda = data.order || data;
      await fetchVendas();
      setVendaSelecionada(novaVenda);
      setShowModalNovaVenda(false);
      setNovoCliente("");
      alert(`Venda iniciada com sucesso!`);
    } catch (error) {
      console.error("Erro ao abrir venda:", error);
      alert("Erro ao conectar com o servidor");
    }
  };

  // Adicionar item à venda
  const addItemToVenda = async (produto: Product) => {
    if (!vendaSelecionada) {
      alert("Selecione uma venda primeiro");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/orders/${vendaSelecionada.id}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            product_id: produto.id,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        alert(error.message || "Erro ao adicionar item");
        return;
      }

      await fetchVendas();
      const updatedResponse = await fetch(
        `http://localhost:8000/api/orders/${vendaSelecionada.id}`,
      );
      const updatedVenda = await updatedResponse.json();
      setVendaSelecionada({
        ...updatedVenda,
        total:
          updatedVenda.items?.reduce(
            (sum: number, item: any) =>
              sum + Number(item.price) * item.quantity,
            0,
          ) || 0,
      });
      alert(`${produto.name} adicionado!`);
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      alert("Erro ao conectar com o servidor");
    }
  };

  // Remover item da venda
  const removerItem = async (vendaId: number, itemId: number) => {
    if (!confirm("Remover este item da venda?")) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/order-items/${itemId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        alert("Erro ao remover item");
        return;
      }

      await fetchVendas();
      const updatedResponse = await fetch(
        `http://localhost:8000/api/orders/${vendaId}`,
      );
      const updatedVenda = await updatedResponse.json();
      setVendaSelecionada({
        ...updatedVenda,
        total:
          updatedVenda.items?.reduce(
            (sum: number, item: any) =>
              sum + Number(item.price) * item.quantity,
            0,
          ) || 0,
      });
      alert("Item removido!");
    } catch (error) {
      console.error("Erro ao remover item:", error);
      alert("Erro ao conectar com o servidor");
    }
  };

  // Finalizar venda
  const finalizarVenda = async () => {
    if (!vendaSelecionada) return;
    if (!formaPagamento) {
      alert("Selecione uma forma de pagamento");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/orders/${vendaSelecionada.id}/close`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            payment_method: formaPagamento,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        alert(error.message || "Erro ao finalizar venda");
        return;
      }

      setVendaSelecionada(null);
      await fetchVendas();
      setShowModalFecharVenda(false);
      setFormaPagamento("");
      alert("Venda finalizada com sucesso!");
    } catch (error) {
      console.error("Erro ao finalizar venda:", error);
      alert("Erro ao conectar com o servidor");
    }
  };

  const limparFiltroData = () => {
    setDataInicio("");
    setDataFim("");
    setShowFiltroData(false);
  };

  const formatCurrency = (value: any): string => {
    const num = typeof value === "number" ? value : Number(value) || 0;
    return `R$ ${num.toFixed(2).replace(".", ",")}`;
  };

  const calcularTotal = (items?: VendaItem[]) => {
    if (!items) return 0;
    return items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );
  };

  // Componente de listagem de Comandas
  const ListaComandas = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Filtros */}
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
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setFiltroVenda("abertas")}
              style={{
                padding: "6px 16px",
                borderRadius: 20,
                border:
                  filtroVenda === "abertas"
                    ? "1px solid #10b981"
                    : "1px solid #e5e7eb",
                background: filtroVenda === "abertas" ? "#f0fdf4" : "#fff",
                color: filtroVenda === "abertas" ? "#059669" : "#6b7280",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Abertas
            </button>
            <button
              onClick={() => setFiltroVenda("fechadas")}
              style={{
                padding: "6px 16px",
                borderRadius: 20,
                border:
                  filtroVenda === "fechadas"
                    ? "1px solid #10b981"
                    : "1px solid #e5e7eb",
                background: filtroVenda === "fechadas" ? "#f0fdf4" : "#fff",
                color: filtroVenda === "fechadas" ? "#059669" : "#6b7280",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Fechadas
            </button>
            <button
              onClick={() => setFiltroVenda("todas")}
              style={{
                padding: "6px 16px",
                borderRadius: 20,
                border:
                  filtroVenda === "todas"
                    ? "1px solid #10b981"
                    : "1px solid #e5e7eb",
                background: filtroVenda === "todas" ? "#f0fdf4" : "#fff",
                color: filtroVenda === "todas" ? "#059669" : "#6b7280",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Todas
            </button>
          </div>

          <div style={{ flex: 1 }} />

          <button
            onClick={() => setShowFiltroData(!showFiltroData)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            <FontAwesomeIcon icon={faFilter} /> Filtrar por Data
          </button>

          {(dataInicio || dataFim) && (
            <button
              onClick={limparFiltroData}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "none",
                background: "#fee2e2",
                color: "#dc2626",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Limpar Filtros
            </button>
          )}
        </div>

        {showFiltroData && (
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <div>
              <label
                style={{
                  fontSize: 11,
                  color: "#6b7280",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Data Início
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                style={{
                  padding: "8px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  fontSize: 13,
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 11,
                  color: "#6b7280",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Data Fim
              </label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                style={{
                  padding: "8px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  fontSize: 13,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Cards de Comandas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
        }}
      >
        {vendasFiltradas.map((venda) => (
          <div
            key={venda.id}
            onClick={() => setVendaSelecionada(venda)}
            style={{
              background:
                vendaSelecionada?.id === venda.id ? "#f0fdf4" : "#fff",
              borderRadius: 12,
              padding: 16,
              border:
                vendaSelecionada?.id === venda.id
                  ? "2px solid #10b981"
                  : "1px solid #e5e7eb",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 12,
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                  {venda.customer_name}
                </h3>
                <p
                  style={{ margin: "4px 0 0", fontSize: 11, color: "#6b7280" }}
                >
                  Venda #{venda.id}
                </p>
              </div>
              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: 12,
                  fontSize: 10,
                  background: venda.status === "aberto" ? "#d1fae5" : "#fee2e2",
                  color: venda.status === "aberto" ? "#059669" : "#dc2626",
                }}
              >
                {venda.status === "aberto" ? "Em andamento" : "Finalizada"}
              </span>
            </div>

            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 12, color: "#6b7280" }}>Itens:</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>
                  {venda.items?.length || 0}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 12, color: "#6b7280" }}>Total:</span>
                <span
                  style={{ fontSize: 16, fontWeight: 700, color: "#059669" }}
                >
                  {formatCurrency(venda.total || 0)}
                </span>
              </div>
              {venda.created_at && (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>Data:</span>
                  <span style={{ fontSize: 11, color: "#6b7280" }}>
                    {new Date(venda.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {vendasFiltradas.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#9ca3af",
          }}
        >
          <FontAwesomeIcon
            icon={faClipboardList}
            style={{ fontSize: 48, marginBottom: 12 }}
          />
          <p>Nenhuma venda encontrada</p>
          <p style={{ fontSize: 12 }}>
            Clique em "Nova Venda" para iniciar um atendimento
          </p>
        </div>
      )}
    </div>
  );

  // Modal Nova Venda
  const ModalNovaVenda = () => (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={() => setShowModalNovaVenda(false)}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          width: "90%",
          maxWidth: 450,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20 }}>Nova Venda</h2>
          <button
            onClick={() => setShowModalNovaVenda(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Ponto de Venda <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <select
            value={pontoSelecionado}
            onChange={(e) => setPontoSelecionado(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: 14,
            }}
          >
            {pontosVenda.map((ponto) => (
              <option key={ponto.id} value={ponto.id}>
                {ponto.number === 0
                  ? "Balcão"
                  : `Ponto ${ponto.number.toString().padStart(2, "0")}`}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Nome do Cliente <span style={{ color: "#9ca3af" }}>(opcional)</span>
          </label>
          <input
            type="text"
            value={novoCliente}
            onChange={(e) => setNovoCliente(e.target.value)}
            placeholder="Ex: João Silva"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: 14,
            }}
            autoFocus
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setShowModalNovaVenda(false)}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={abrirVenda}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              border: "none",
              background: "#10b981",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Iniciar Venda
          </button>
        </div>
      </div>
    </div>
  );

  // Modal Finalizar Venda
  const ModalFinalizarVenda = () => {
    const total = calcularTotal(vendaSelecionada?.items);
    const opcoesPagamento = [
      { value: "dinheiro", label: "Dinheiro", icon: "💰" },
      { value: "pix", label: "PIX", icon: "📱" },
      { value: "credito", label: "Cartão de Crédito", icon: "💳" },
      { value: "debito", label: "Cartão de Débito", icon: "💳" },
    ];

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
        onClick={() => setShowModalFecharVenda(false)}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 24,
            width: "90%",
            maxWidth: 450,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 style={{ margin: "0 0 8px 0", fontSize: 24 }}>Finalizar Venda</h2>
          <p style={{ margin: "0 0 20px 0", color: "#6b7280" }}>
            Cliente: {vendaSelecionada?.customer_name}
          </p>

          <div
            style={{
              background: "#f3f4f6",
              padding: 16,
              borderRadius: 8,
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Total da venda:</span>
              <span
                style={{ fontSize: 18, fontWeight: "bold", color: "#059669" }}
              >
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Forma de pagamento:
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {opcoesPagamento.map((opcao) => (
                <button
                  key={opcao.value}
                  onClick={() => setFormaPagamento(opcao.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 8,
                    border:
                      formaPagamento === opcao.value
                        ? "2px solid #10b981"
                        : "1px solid #e5e7eb",
                    background:
                      formaPagamento === opcao.value ? "#f0fdf4" : "#fff",
                    cursor: "pointer",
                  }}
                >
                  <span>
                    {opcao.icon} {opcao.label}
                  </span>
                  {formaPagamento === opcao.value && (
                    <span style={{ color: "#10b981" }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => setShowModalFecharVenda(false)}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={finalizarVenda}
              disabled={!formaPagamento}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 8,
                border: "none",
                background: !formaPagamento ? "#9ca3af" : "#10b981",
                color: "#fff",
                cursor: !formaPagamento ? "not-allowed" : "pointer",
              }}
            >
              Finalizar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Versão Desktop
  if (!isMobile) {
    return (
      <>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr 380px",
            height: "100%",
            background: "#FAFAFA",
          }}
        >
          <SidebarVendas
            abaAtiva={abaAtiva}
            onAbaChange={setAbaAtiva}
            onNovaVenda={() => setShowModalNovaVenda(true)}
            onVoltarDashboard={() => setTela && setTela("dashboard")}
          />

          {/* Conteúdo do Meio - Produtos ou Comandas */}
          <div
            style={{
              padding: "20px",
              overflowY: "auto",
              height: "100vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {abaAtiva === "produtos" ? (
              <TabelaProdutosPdv
                produtos={produtos}
                categorias={categorias}
                onProductSelect={(produto) => addItemToVenda(produto)}
                disabled={!vendaSelecionada}
                isMobile={false}
              />
            ) : (
              <ListaComandas />
            )}
          </div>

          {/* Detalhes da Venda Selecionada */}
          <div
            style={{
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              height: "100vh",
            }}
          >
            <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                Venda Atual
              </h2>
              {vendaSelecionada && (
                <p
                  style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}
                >
                  Cliente: {vendaSelecionada.customer_name} • #
                  {vendaSelecionada.id}
                </p>
              )}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              {!vendaSelecionada ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#9ca3af",
                    padding: "40px",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faShoppingCart}
                    style={{ fontSize: 48, marginBottom: 12 }}
                  />
                  <p>Selecione uma venda na lista de comandas</p>
                </div>
              ) : vendaSelecionada.items?.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#9ca3af",
                    padding: "40px",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faShoppingCart}
                    style={{ fontSize: 48, marginBottom: 12 }}
                  />
                  <p>Nenhum item adicionado</p>
                  <p style={{ fontSize: 12 }}>
                    Clique nos produtos ao lado para adicionar
                  </p>
                </div>
              ) : (
                vendaSelecionada.items?.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      marginBottom: 8,
                      background: "#f9fafb",
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>
                        {item.product?.name || `Produto ${item.product_id}`}
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        {item.quantity}x {formatCurrency(item.price)} ={" "}
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                    <button
                      onClick={() => removerItem(vendaSelecionada.id, item.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#dc2626",
                        fontSize: 16,
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))
              )}
            </div>
            {vendaSelecionada && vendaSelecionada.status === "aberto" && (
              <div style={{ padding: "20px", borderTop: "1px solid #e5e7eb" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 16 }}>Total</span>
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: 20,
                      color: "#059669",
                    }}
                  >
                    {formatCurrency(calcularTotal(vendaSelecionada.items))}
                  </span>
                </div>
                <button
                  onClick={() => setShowModalFecharVenda(true)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#059669";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#10b981";
                  }}
                >
                  <FontAwesomeIcon icon={faCheck} style={{ marginRight: 8 }} />
                  Finalizar Venda
                </button>
              </div>
            )}
          </div>
        </div>
        {showModalNovaVenda && <ModalNovaVenda />}
        {showModalFecharVenda && <ModalFinalizarVenda />}
      </>
    );
  }

  // Versão Mobile
  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh" }}>
      <div
        style={{
          padding: "16px",
          background: "#1f2937",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: "#374151",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FontAwesomeIcon
              icon={faCashRegister}
              style={{ fontSize: 18, color: "#10b981" }}
            />
          </div>
          <h1
            style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#fff" }}
          >
            Gestão de Vendas
          </h1>
        </div>
        <button
          onClick={() => setShowMobileMenu(true)}
          style={{
            background: "#374151",
            border: "none",
            borderRadius: 8,
            padding: "8px 12px",
            cursor: "pointer",
            color: "#fff",
          }}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>

      <div style={{ padding: "12px 16px" }}>
        <button
          onClick={() => setTela && setTela("dashboard")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            padding: "10px 16px",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            cursor: "pointer",
            color: "#374151",
            fontSize: 14,
          }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Voltar ao Dashboard
        </button>
      </div>

      {/* Abas Mobile */}
      <div
        style={{ padding: "0 16px", display: "flex", gap: 8, marginBottom: 16 }}
      >
        <button
          onClick={() => setAbaAtiva("produtos")}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: 8,
            border:
              abaAtiva === "produtos"
                ? "1px solid #10b981"
                : "1px solid #e5e7eb",
            background: abaAtiva === "produtos" ? "#10b981" : "#fff",
            color: abaAtiva === "produtos" ? "#fff" : "#374151",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          <FontAwesomeIcon icon={faBoxes} /> Produtos
        </button>
        <button
          onClick={() => setAbaAtiva("comandas")}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: 8,
            border:
              abaAtiva === "comandas"
                ? "1px solid #10b981"
                : "1px solid #e5e7eb",
            background: abaAtiva === "comandas" ? "#10b981" : "#fff",
            color: abaAtiva === "comandas" ? "#fff" : "#374151",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          <FontAwesomeIcon icon={faClipboardList} /> Comandas
        </button>
      </div>

      {/* Menu Mobile */}
      {showMobileMenu && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 1000,
            }}
            onClick={() => setShowMobileMenu(false)}
          />
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: "280px",
              background: "#1f2937",
              zIndex: 1001,
              padding: "20px",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 20,
              }}
            >
              <button
                onClick={() => setShowMobileMenu(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "#fff",
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <button
              onClick={() => {
                setShowModalNovaVenda(true);
                setShowMobileMenu(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "12px 16px",
                background: "#10b981",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                color: "#fff",
                marginBottom: 12,
              }}
            >
              <FontAwesomeIcon icon={faPlus} /> <span>Nova Venda</span>
            </button>
          </div>
        </>
      )}

      {/* Conteúdo Mobile */}
      <div style={{ padding: "16px" }}>
        {abaAtiva === "produtos" ? (
          <TabelaProdutosPdv
            produtos={produtos}
            categorias={categorias}
            onProductSelect={(produto) => addItemToVenda(produto)}
            disabled={!vendaSelecionada}
            isMobile={true}
          />
        ) : (
          vendasFiltradas.map((venda) => (
            <div
              key={venda.id}
              onClick={() => setVendaSelecionada(venda)}
              style={{
                background:
                  vendaSelecionada?.id === venda.id ? "#f0fdf4" : "#fff",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                border:
                  vendaSelecionada?.id === venda.id
                    ? "2px solid #10b981"
                    : "1px solid #e5e7eb",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>
                    {venda.customer_name}
                  </h3>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 11,
                      color: "#6b7280",
                    }}
                  >
                    #{venda.id}
                  </p>
                </div>
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: 12,
                    fontSize: 10,
                    background:
                      venda.status === "aberto" ? "#d1fae5" : "#fee2e2",
                    color: venda.status === "aberto" ? "#059669" : "#dc2626",
                  }}
                >
                  {venda.status === "aberto" ? "Aberta" : "Finalizada"}
                </span>
              </div>
              <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 12 }}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ fontSize: 12, color: "#6b7280" }}>Total:</span>
                  <span
                    style={{ fontSize: 16, fontWeight: 700, color: "#059669" }}
                  >
                    {formatCurrency(venda.total || 0)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {vendaSelecionada && vendaSelecionada.status === "aberto" && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#fff",
            borderTop: "1px solid #e5e7eb",
            padding: "16px",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span>{vendaSelecionada.customer_name}</span>
            <span
              style={{ fontWeight: "bold", color: "#059669", fontSize: 18 }}
            >
              {formatCurrency(calcularTotal(vendaSelecionada.items))}
            </span>
          </div>
          <button
            onClick={() => setShowModalFecharVenda(true)}
            style={{
              width: "100%",
              padding: "10px",
              background: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Finalizar Venda
          </button>
        </div>
      )}

      {showModalNovaVenda && <ModalNovaVenda />}
      {showModalFecharVenda && <ModalFinalizarVenda />}
    </div>
  );
}
