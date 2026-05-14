import { useState, useEffect, useCallback, useRef } from "react";

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  category_id: number;
  type: "entrada" | "saida";
  category?: ExpenseCategory;
  notes: string | null;
  source?: "pdv" | "manual";
}

interface ExpenseCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
  is_active: boolean;
}

interface Order {
  id: number;
  customer_name: string;
  total: number;
  closed_at: string;
  payment_method: string;
  status: string;
  table_id: number;
}

export default function Caixa() {
  const hoje = new Date().toISOString().split("T")[0];
  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth() + 1;

  const [anoSelecionado, setAnoSelecionado] = useState(anoAtual);
  const [mesSelecionado, setMesSelecionado] = useState(mesAtual);
  const [transacoes, setTransacoes] = useState<Transaction[]>([]);
  const [categorias, setCategorias] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [diasExpandidos, setDiasExpandidos] = useState<{
    [key: string]: boolean;
  }>({});
  const [showEntradas, setShowEntradas] = useState(true);
  const [showSaidas, setShowSaidas] = useState(true);

  const [showModalGerenciar, setShowModalGerenciar] = useState(false);
  const [showModalCategoria, setShowModalCategoria] = useState(false);
  const [showModalSaida, setShowModalSaida] = useState(false);
  const [editandoCategoria, setEditandoCategoria] =
    useState<ExpenseCategory | null>(null);

  const [novaCategoria, setNovaCategoria] = useState({
    name: "",
    icon: "📌",
    color: "#6b7280",
  });

  const [novaSaida, setNovaSaida] = useState({
    descricao: "",
    valor: 0,
    category_id: 0,
    data: hoje,
  });

  const [filtroCategoria, setFiltroCategoria] = useState<number | null>(null);

  const isFirstRender = useRef(true);

  const cores = [
    "#dc2626",
    "#f59e0b",
    "#3b82f6",
    "#fbbf24",
    "#ef4444",
    "#8b5cf6",
    "#10b981",
    "#6b7280",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#06b6d4",
    "#84cc16",
    "#d946ef",
    "#f43f5e",
  ];

  const fetchCategorias = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/expense-categories?restaurant_id=1",
      );
      if (!response.ok) throw new Error("Erro ao buscar categorias");
      const data = await response.json();
      setCategorias(data);

      if (data.length > 0 && novaSaida.category_id === 0) {
        setNovaSaida((prev) => ({ ...prev, category_id: data[0].id }));
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  const fetchEntradas = useCallback(async () => {
    try {
      const startDate = `${anoSelecionado}-${String(mesSelecionado).padStart(2, "0")}-01`;
      const lastDay = new Date(anoSelecionado, mesSelecionado, 0).getDate();
      const endDate = `${anoSelecionado}-${String(mesSelecionado).padStart(2, "0")}-${lastDay}`;

      const response = await fetch(
        `http://localhost:8000/api/orders?restaurant_id=1`,
      );
      if (!response.ok) throw new Error("Erro ao buscar vendas");

      const orders: Order[] = await response.json();

      const vendasNoPeriodo = orders.filter((order) => {
        if (order.status !== "fechado") return false;
        const orderDate = order.closed_at
          ? new Date(order.closed_at).toISOString().split("T")[0]
          : null;
        return orderDate >= startDate && orderDate <= endDate;
      });

      const entradas: Transaction[] = vendasNoPeriodo.map((order) => ({
        id: order.id,
        description: `Venda - ${order.customer_name || `Mesa ${order.table_id}`}`,
        amount: Number(order.total) || 0,
        date: order.closed_at
          ? order.closed_at.split("T")[0]
          : new Date().toISOString().split("T")[0],
        category_id: 0,
        type: "entrada",
        category: undefined,
        notes: `Pagamento: ${order.payment_method}`,
        source: "pdv",
      }));

      return entradas;
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
      return [];
    }
  }, [anoSelecionado, mesSelecionado]);

  const fetchSaidas = useCallback(async () => {
    try {
      const startDate = `${anoSelecionado}-${String(mesSelecionado).padStart(2, "0")}-01`;
      const lastDay = new Date(anoSelecionado, mesSelecionado, 0).getDate();
      const endDate = `${anoSelecionado}-${String(mesSelecionado).padStart(2, "0")}-${lastDay}`;

      const url = `http://localhost:8000/api/expenses?restaurant_id=1&start_date=${startDate}&end_date=${endDate}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error("Erro ao buscar saídas");

      const data = await response.json();

      const saidas: Transaction[] = data.map((item: any) => {
        const categoria = categorias.find((c) => c.id === item.category_id);
        return {
          id: item.id,
          description: item.description,
          amount: Number(item.amount) || 0,
          date: item.expense_date.split("T")[0],
          category_id: item.category_id,
          type: "saida",
          category: categoria,
          notes: item.notes,
          source: "manual",
        };
      });

      return saidas;
    } catch (error) {
      console.error("Erro ao buscar saídas:", error);
      return [];
    }
  }, [anoSelecionado, mesSelecionado, categorias]);

  const fetchTransacoes = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const [entradas, saidas] = await Promise.all([
        fetchEntradas(),
        fetchSaidas(),
      ]);

      const todasTransacoes = [...entradas, ...saidas];
      todasTransacoes.sort((a, b) => b.date.localeCompare(a.date));

      setTransacoes(todasTransacoes);

      const diasUnicos = [...new Set(todasTransacoes.map((t) => t.date))];
      const novosExpandidos: { [key: string]: boolean } = {};
      diasUnicos.forEach((data) => {
        novosExpandidos[data] = true;
      });
      setDiasExpandidos((prev) => ({ ...prev, ...novosExpandidos }));
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      setTransacoes([]);
    } finally {
      setLoading(false);
    }
  }, [fetchEntradas, fetchSaidas, loading]);

  useEffect(() => {
    fetchCategorias();
  }, []);

  useEffect(() => {
    if (categorias.length > 0 && !isFirstRender.current) {
      fetchTransacoes();
    }
  }, [anoSelecionado, mesSelecionado]);

  useEffect(() => {
    if (categorias.length > 0 && isFirstRender.current) {
      fetchTransacoes();
      isFirstRender.current = false;
    }
  }, [categorias]);

  const adicionarCategoria = async () => {
    if (!novaCategoria.name.trim()) {
      alert("Digite o nome da categoria");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/api/expense-categories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            restaurant_id: 1,
            name: novaCategoria.name,
            icon: novaCategoria.icon,
            color: novaCategoria.color,
          }),
        },
      );

      if (!response.ok) throw new Error("Erro ao criar categoria");

      await fetchCategorias();
      setShowModalCategoria(false);
      setNovaCategoria({ name: "", icon: "📌", color: "#6b7280" });
      alert("Categoria adicionada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao adicionar categoria");
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
        `http://localhost:8000/api/expense-categories/${editandoCategoria.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: editandoCategoria.name,
            icon: editandoCategoria.icon,
            color: editandoCategoria.color,
          }),
        },
      );

      if (!response.ok) throw new Error("Erro ao editar categoria");

      await fetchCategorias();
      setEditandoCategoria(null);
      alert("Categoria atualizada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao editar categoria");
    }
  };

  const excluirCategoria = async (id: number, name: string) => {
    const temSaidas = transacoes.some(
      (t) => t.type === "saida" && t.category_id === id,
    );

    if (temSaidas) {
      if (
        !confirm(
          `A categoria "${name}" possui gastos associados. Excluir mesmo assim?`,
        )
      ) {
        return;
      }
    } else {
      if (!confirm(`Tem certeza que deseja excluir a categoria "${name}"?`)) {
        return;
      }
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/expense-categories/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        alert(error.message || "Erro ao excluir categoria");
        return;
      }

      await fetchCategorias();

      if (filtroCategoria === id) {
        setFiltroCategoria(null);
      }

      alert("Categoria excluída com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir categoria");
    }
  };

  const adicionarSaida = async () => {
    if (!novaSaida.descricao || novaSaida.valor <= 0) {
      alert("Preencha a descrição e o valor");
      return;
    }

    if (!novaSaida.category_id) {
      alert("Selecione uma categoria");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          restaurant_id: 1,
          description: novaSaida.descricao,
          amount: Number(novaSaida.valor),
          expense_date: novaSaida.data,
          category_id: novaSaida.category_id,
          type: "saida",
          notes: null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.message || "Erro ao adicionar saída");
        return;
      }

      setNovaSaida({
        descricao: "",
        valor: 0,
        category_id: categorias[0]?.id || 0,
        data: hoje,
      });
      setShowModalSaida(false);
      fetchTransacoes();
      alert("Saída adicionada com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar saída:", error);
      alert("Erro ao conectar com o servidor");
    }
  };

  const removerTransacao = async (
    id: number,
    type: string,
    source?: string,
  ) => {
    if (!confirm("Remover esse lançamento?")) return;

    if (type === "entrada" && source === "pdv") {
      alert("Entradas do PDV não podem ser removidas aqui.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/expenses/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        alert("Erro ao remover");
        return;
      }

      fetchTransacoes();
      alert("Removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover:", error);
      alert("Erro ao conectar com o servidor");
    }
  };

  const toggleDia = (data: string) => {
    setDiasExpandidos((prev) => ({ ...prev, [data]: !prev[data] }));
  };

  const formatCurrency = (value: any): string => {
    const num = typeof value === "number" ? value : Number(value) || 0;
    return `R$ ${num.toFixed(2)}`;
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "-";
    return dateString.split("-").reverse().join("/");
  };

  const totalEntradas = transacoes
    .filter((t) => t.type === "entrada")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalSaidas = transacoes
    .filter((t) => t.type === "saida")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const saldoGeral = (totalEntradas || 0) - (totalSaidas || 0);

  const transacoesFiltradas = transacoes.filter((t) => {
    const matchCategoria = filtroCategoria
      ? t.category_id === filtroCategoria
      : true;
    const matchTipo =
      (t.type === "entrada" && showEntradas) ||
      (t.type === "saida" && showSaidas);
    return matchCategoria && matchTipo;
  });

  const transacoesPorData = transacoesFiltradas.reduce(
    (acc: any, transacao) => {
      const data = transacao.date;
      if (!acc[data]) acc[data] = [];
      acc[data].push(transacao);
      return acc;
    },
    {},
  );

  const totalEntradasPorData = Object.keys(transacoesPorData).reduce(
    (acc: any, data) => {
      acc[data] = transacoesPorData[data]
        .filter((t: Transaction) => t.type === "entrada")
        .reduce(
          (sum: number, t: Transaction) => sum + (Number(t.amount) || 0),
          0,
        );
      return acc;
    },
    {},
  );

  const totalSaidasPorData = Object.keys(transacoesPorData).reduce(
    (acc: any, data) => {
      acc[data] = transacoesPorData[data]
        .filter((t: Transaction) => t.type === "saida")
        .reduce(
          (sum: number, t: Transaction) => sum + (Number(t.amount) || 0),
          0,
        );
      return acc;
    },
    {},
  );

  const saldoPorData = Object.keys(transacoesPorData).reduce(
    (acc: any, data) => {
      const entradas = totalEntradasPorData[data] || 0;
      const saidas = totalSaidasPorData[data] || 0;
      acc[data] = entradas - saidas;
      return acc;
    },
    {},
  );

  const anos = Array.from({ length: 5 }, (_, i) => anoAtual - i);
  const meses = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" },
  ];

  const ModalAdicionarSaida = () => (
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
        zIndex: 1001,
      }}
      onClick={() => setShowModalSaida(false)}
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
        <h2 style={{ margin: "0 0 20px 0", fontSize: 20 }}>
          Nova Saída (Gasto)
        </h2>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Data:
          </label>
          <input
            type="date"
            value={novaSaida.data}
            onChange={(e) =>
              setNovaSaida({ ...novaSaida, data: e.target.value })
            }
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              fontSize: 14,
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Descrição:
          </label>
          <input
            type="text"
            placeholder="Ex: Compra de insumos..."
            value={novaSaida.descricao}
            onChange={(e) =>
              setNovaSaida({ ...novaSaida, descricao: e.target.value })
            }
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              fontSize: 14,
            }}
            autoFocus
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Categoria:
          </label>
          <select
            value={novaSaida.category_id}
            onChange={(e) =>
              setNovaSaida({
                ...novaSaida,
                category_id: Number(e.target.value),
              })
            }
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              fontSize: 14,
            }}
          >
            <option value={0}>Selecione uma categoria</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
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
            Valor (R$):
          </label>
          <input
            type="text"
            placeholder="0,00"
            value={
              novaSaida.valor === 0
                ? ""
                : novaSaida.valor.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
            }
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, "");
              const cents = parseInt(value, 10);
              if (isNaN(cents)) setNovaSaida({ ...novaSaida, valor: 0 });
              else setNovaSaida({ ...novaSaida, valor: cents / 100 });
            }}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              fontSize: 14,
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setShowModalSaida(false)}
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
            onClick={adicionarSaida}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              border: "none",
              background: "#dc2626",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Adicionar Saída
          </button>
        </div>
      </div>
    </div>
  );

  const ModalAdicionarCategoria = () => (
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
        zIndex: 1002,
      }}
      onClick={() => setShowModalCategoria(false)}
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
        <h2 style={{ margin: "0 0 20px 0", fontSize: 20 }}>Nova Categoria</h2>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Nome:
          </label>
          <input
            type="text"
            placeholder="Ex: Combustível, Verduras..."
            value={novaCategoria.name}
            onChange={(e) =>
              setNovaCategoria({ ...novaCategoria, name: e.target.value })
            }
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              fontSize: 14,
            }}
            autoFocus
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Cor:
          </label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 8,
            }}
          >
            {cores.map((cor) => (
              <button
                key={cor}
                onClick={() =>
                  setNovaCategoria({ ...novaCategoria, color: cor })
                }
                style={{
                  width: 32,
                  height: 32,
                  background: cor,
                  border:
                    novaCategoria.color === cor
                      ? "2px solid #10b981"
                      : "1px solid #e5e7eb",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
          <input
            type="color"
            value={novaCategoria.color}
            onChange={(e) =>
              setNovaCategoria({ ...novaCategoria, color: e.target.value })
            }
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              cursor: "pointer",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setShowModalCategoria(false)}
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
            onClick={adicionarCategoria}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              border: "none",
              background: "#10b981",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  );

  const ModalGerenciarCategorias = () => (
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
      onClick={() => {
        setShowModalGerenciar(false);
        setEditandoCategoria(null);
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          width: "90%",
          maxWidth: 550,
          maxHeight: "80vh",
          overflowY: "auto",
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
          <h2 style={{ margin: 0, fontSize: 20 }}>Gerenciar Categorias</h2>
          <button
            onClick={() => setShowModalCategoria(true)}
            style={{
              padding: "6px 12px",
              background: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            + Nova Categoria
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {categorias.map((cat) => (
            <div
              key={cat.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: "#f9fafb",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
              }}
            >
              {editandoCategoria?.id === cat.id ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    type="text"
                    value={editandoCategoria.name}
                    onChange={(e) =>
                      setEditandoCategoria({
                        ...editandoCategoria,
                        name: e.target.value,
                      })
                    }
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid #e5e7eb",
                      flex: 1,
                    }}
                    autoFocus
                  />
                  <input
                    type="color"
                    value={editandoCategoria.color}
                    onChange={(e) =>
                      setEditandoCategoria({
                        ...editandoCategoria,
                        color: e.target.value,
                      })
                    }
                    style={{
                      width: 50,
                      height: 36,
                      borderRadius: 6,
                      border: "1px solid #e5e7eb",
                      cursor: "pointer",
                    }}
                  />
                  <button
                    onClick={editarCategoria}
                    style={{
                      padding: "6px 12px",
                      background: "#10b981",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setEditandoCategoria(null)}
                    style={{
                      padding: "6px 12px",
                      background: "#6b7280",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        background: cat.color,
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>
                      {cat.name}
                    </span>
                    {transacoes.some(
                      (t) => t.type === "saida" && t.category_id === cat.id,
                    ) && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "#f59e0b",
                          background: "#fef3c7",
                          padding: "2px 6px",
                          borderRadius: 12,
                        }}
                      >
                        em uso
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => setEditandoCategoria(cat)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: 18,
                        cursor: "pointer",
                        color: "#6b7280",
                      }}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => excluirCategoria(cat.id, cat.name)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: 18,
                        cursor: "pointer",
                        color: "#dc2626",
                      }}
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setShowModalGerenciar(false);
            setEditandoCategoria(null);
          }}
          style={{
            marginTop: 20,
            width: "100%",
            padding: "10px",
            background: "#374151",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Fechar
        </button>
      </div>
    </div>
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        height: "100%",
        background: "#FAFAFA",
      }}
    >
      {/* SIDEBAR */}
      <div
        style={{
          background: "#1f2937",
          color: "#fff",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <div style={{ padding: "16px", borderBottom: "1px solid #374151" }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
            Ações Rápidas
          </h2>
        </div>

        <div style={{ padding: "16px" }}>
          <button
            onClick={() => setShowModalSaida(true)}
            style={{
              width: "100%",
              padding: "10px",
              background: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 13,
              marginBottom: 10,
            }}
          >
            Nova Saída (Gasto)
          </button>

          <button
            onClick={() => setShowModalGerenciar(true)}
            style={{
              width: "100%",
              padding: "10px",
              background: "#374151",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            Gerenciar Categorias
          </button>

          <div
            style={{
              marginTop: 16,
              padding: "10px",
              background: "#374151",
              borderRadius: 6,
              fontSize: 11,
              color: "#9ca3af",
              textAlign: "center",
            }}
          >
            Entradas importadas do PDV
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
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
              Fluxo de Caixa
            </h2>
            <div style={{ display: "flex", gap: 10 }}>
              <select
                value={mesSelecionado}
                onChange={(e) => setMesSelecionado(Number(e.target.value))}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {meses.map((mes) => (
                  <option key={mes.value} value={mes.value}>
                    {mes.label}
                  </option>
                ))}
              </select>
              <select
                value={anoSelecionado}
                onChange={(e) => setAnoSelecionado(Number(e.target.value))}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {anos.map((ano) => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              padding: "10px 0",
              borderTop: "1px solid #e5e7eb",
              borderBottom: "1px solid #e5e7eb",
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
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>Entradas</div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#10b981",
                    }}
                  >
                    {formatCurrency(totalEntradas)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>Saídas</div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#dc2626",
                    }}
                  >
                    {formatCurrency(totalSaidas)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>Saldo</div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: saldoGeral >= 0 ? "#10b981" : "#dc2626",
                    }}
                  >
                    {formatCurrency(saldoGeral)}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                <button
                  onClick={() => setShowEntradas(!showEntradas)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 20,
                    border: "1px solid #10b981",
                    background: showEntradas ? "#10b981" : "#fff",
                    color: showEntradas ? "#fff" : "#10b981",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  Entradas
                </button>
                <button
                  onClick={() => setShowSaidas(!showSaidas)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 20,
                    border: "1px solid #dc2626",
                    background: showSaidas ? "#dc2626" : "#fff",
                    color: showSaidas ? "#fff" : "#dc2626",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  Saídas
                </button>
              </div>
            </div>
          </div>
        </div>

        {categorias.length > 0 && (
          <div
            style={{
              background: "#fff",
              padding: "10px 14px",
              borderRadius: 8,
              marginBottom: 16,
              border: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>
              Filtrar por categoria:
            </span>
            <button
              onClick={() => setFiltroCategoria(null)}
              style={{
                padding: "3px 10px",
                borderRadius: 16,
                border: "1px solid #e5e7eb",
                background: filtroCategoria === null ? "#10b981" : "#fff",
                color: filtroCategoria === null ? "#fff" : "#374151",
                cursor: "pointer",
                fontSize: 11,
                whiteSpace: "nowrap",
              }}
            >
              Todos
            </button>
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFiltroCategoria(cat.id)}
                style={{
                  padding: "3px 10px",
                  borderRadius: 16,
                  border: `1px solid ${cat.color}`,
                  background: filtroCategoria === cat.id ? cat.color : "#fff",
                  color: filtroCategoria === cat.id ? "#fff" : cat.color,
                  cursor: "pointer",
                  fontSize: 11,
                  whiteSpace: "nowrap",
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            Carregando...
          </div>
        ) : Object.keys(transacoesPorData).length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              background: "#fff",
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
            <p>Nenhuma transação registrada neste mês</p>
          </div>
        ) : (
          Object.keys(transacoesPorData)
            .sort((a, b) => b.localeCompare(a))
            .map((data) => {
              const estaExpandido = diasExpandidos[data] !== false;
              const transacoesDoDia = transacoesPorData[data];
              const totalEntradasDia = totalEntradasPorData[data] || 0;
              const totalSaidasDia = totalSaidasPorData[data] || 0;
              const saldoDia = (totalEntradasDia || 0) - (totalSaidasDia || 0);

              return (
                <div key={data} style={{ marginBottom: 12 }}>
                  <div
                    onClick={() => toggleDia(data)}
                    style={{
                      background: estaExpandido ? "#f3f4f6" : "#fff",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <span style={{ fontSize: 16 }}>
                        {estaExpandido ? "▼" : "▶"}
                      </span>
                      <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
                        {formatDate(data)}
                      </h3>
                      <span style={{ fontSize: 10, color: "#6b7280" }}>
                        ({transacoesDoDia.length}{" "}
                        {transacoesDoDia.length === 1 ? "item" : "itens"})
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ fontSize: 10, color: "#10b981" }}>
                        Entradas: {formatCurrency(totalEntradasDia)}
                      </span>
                      <span style={{ fontSize: 10, color: "#dc2626" }}>
                        Saídas: {formatCurrency(totalSaidasDia)}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: saldoDia >= 0 ? "#10b981" : "#dc2626",
                        }}
                      >
                        Saldo: {formatCurrency(saldoDia)}
                      </span>
                    </div>
                  </div>

                  {estaExpandido && (
                    <div style={{ marginTop: 6, overflowX: "auto" }}>
                      <table
                        style={{
                          width: "100%",
                          background: "#fff",
                          borderRadius: 8,
                          borderCollapse: "collapse",
                        }}
                      >
                        <thead>
                          <tr
                            style={{
                              background: "#f9fafb",
                              borderBottom: "1px solid #e5e7eb",
                            }}
                          >
                            <th
                              style={{
                                padding: "6px 10px",
                                textAlign: "left",
                                fontSize: 10,
                                fontWeight: 600,
                              }}
                            >
                              Descrição
                            </th>
                            <th
                              style={{
                                padding: "6px 10px",
                                textAlign: "left",
                                fontSize: 10,
                                fontWeight: 600,
                              }}
                            >
                              Categoria
                            </th>
                            <th
                              style={{
                                padding: "6px 10px",
                                textAlign: "left",
                                fontSize: 10,
                                fontWeight: 600,
                              }}
                            >
                              Tipo
                            </th>
                            <th
                              style={{
                                padding: "6px 10px",
                                textAlign: "right",
                                fontSize: 10,
                                fontWeight: 600,
                              }}
                            >
                              Valor
                            </th>
                            <th
                              style={{
                                padding: "6px 10px",
                                textAlign: "center",
                                fontSize: 10,
                                fontWeight: 600,
                              }}
                            >
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {transacoesDoDia.map((t: Transaction) => (
                            <tr
                              key={`${t.type}-${t.id}`}
                              style={{ borderBottom: "1px solid #f0f0f0" }}
                            >
                              <td
                                style={{ padding: "6px 10px", fontSize: 11 }}
                                title={t.description}
                              >
                                {t.description.length > 35
                                  ? t.description.substring(0, 35) + "..."
                                  : t.description}
                              </td>
                              <td style={{ padding: "6px 10px" }}>
                                {t.type === "entrada" ? (
                                  <span
                                    style={{
                                      display: "inline-block",
                                      padding: "2px 6px",
                                      borderRadius: 12,
                                      fontSize: 9,
                                      background: "#d1fae5",
                                      color: "#059669",
                                    }}
                                  >
                                    PDV
                                  </span>
                                ) : t.category ? (
                                  <span
                                    style={{
                                      display: "inline-block",
                                      padding: "2px 6px",
                                      borderRadius: 12,
                                      fontSize: 9,
                                      background: `${t.category.color}15`,
                                      color: t.category.color,
                                    }}
                                  >
                                    {t.category.name}
                                  </span>
                                ) : (
                                  <span
                                    style={{ fontSize: 10, color: "#9ca3af" }}
                                  >
                                    Sem categoria
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: "6px 10px", fontSize: 11 }}>
                                {t.type === "entrada" ? "Entrada" : "Saída"}
                              </td>
                              <td
                                style={{
                                  padding: "6px 10px",
                                  textAlign: "right",
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color:
                                    t.type === "entrada"
                                      ? "#10b981"
                                      : "#dc2626",
                                }}
                              >
                                {formatCurrency(t.amount)}
                              </td>
                              <td
                                style={{
                                  padding: "6px 10px",
                                  textAlign: "center",
                                }}
                              >
                                {t.type === "saida" && (
                                  <button
                                    onClick={() =>
                                      removerTransacao(t.id, t.type, t.source)
                                    }
                                    style={{
                                      background: "none",
                                      border: "none",
                                      fontSize: 14,
                                      cursor: "pointer",
                                      color: "#dc2626",
                                    }}
                                    title="Remover"
                                  >
                                    🗑️
                                  </button>
                                )}
                                {t.type === "entrada" && (
                                  <span
                                    style={{ fontSize: 10, color: "#9ca3af" }}
                                  >
                                    PDV
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
        )}
      </div>

      {showModalGerenciar && <ModalGerenciarCategorias />}
      {showModalCategoria && <ModalAdicionarCategoria />}
      {showModalSaida && <ModalAdicionarSaida />}
    </div>
  );
}
