import { useState, useEffect } from "react";

interface Expense {
  id: number;
  description: string;
  amount: number;
  expense_date: string;
  category: string;
  notes: string | null;
  created_at: string;
}

export default function Caixa() {
  const hoje = new Date().toISOString().split("T")[0];
  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth() + 1;

  const [anoSelecionado, setAnoSelecionado] = useState(anoAtual);
  const [mesSelecionado, setMesSelecionado] = useState(mesAtual);
  const [gastos, setGastos] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  const [novo, setNovo] = useState({
    descricao: "",
    valor: 0,
    categoria: "mercado",
    data: hoje,
  });

  const [filtroCategoria, setFiltroCategoria] = useState("");

  const categorias = [
    { value: "carnes", label: "🥩 Carnes", color: "#dc2626" },
    { value: "mercado", label: "🛒 Mercado", color: "#f59e0b" },
    { value: "agua", label: "💧 Água", color: "#3b82f6" },
    { value: "luz", label: "⚡ Luz", color: "#fbbf24" },
    { value: "gas", label: "🔥 Gás", color: "#ef4444" },
    { value: "bebidas", label: "🍺 Bebidas", color: "#8b5cf6" },
    { value: "embalagens", label: "📦 Embalagens", color: "#10b981" },
    { value: "outros", label: "📌 Outros", color: "#6b7280" },
  ];

  // Função auxiliar para formatar moeda
  const formatCurrency = (value: any): string => {
    const number = typeof value === "number" ? value : Number(value) || 0;
    return `R$ ${number.toFixed(2)}`;
  };

  // Função para formatar data
  const formatDate = (dateString: string): string => {
    if (!dateString) return "-";
    const date = dateString.split("T")[0];
    return date.split("-").reverse().join("/");
  };

  // Gerar anos para select (últimos 5 anos)
  const anos = Array.from({ length: 5 }, (_, i) => anoAtual - i);

  // Meses para select
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

  // Buscar gastos da API
  const fetchGastos = async () => {
    setLoading(true);
    try {
      const startDate = `${anoSelecionado}-${String(mesSelecionado).padStart(2, "0")}-01`;
      const lastDay = new Date(anoSelecionado, mesSelecionado, 0).getDate();
      const endDate = `${anoSelecionado}-${String(mesSelecionado).padStart(2, "0")}-${lastDay}`;

      const url = `http://localhost:8000/api/expenses?restaurant_id=1&start_date=${startDate}&end_date=${endDate}`;
      const response = await fetch(url);
      const data = await response.json();

      // Garantir que amount seja número
      const gastosFormatados = data.map((gasto: any) => ({
        ...gasto,
        amount: Number(gasto.amount) || 0,
      }));

      // Ordenar por data (mais recente primeiro)
      gastosFormatados.sort((a: Expense, b: Expense) =>
        b.expense_date.localeCompare(a.expense_date),
      );

      setGastos(gastosFormatados);
    } catch (error) {
      console.error("Erro ao buscar gastos:", error);
      alert("Erro ao carregar gastos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGastos();
  }, [anoSelecionado, mesSelecionado]);

  const adicionarGasto = async () => {
    if (!novo.descricao || novo.valor <= 0) {
      alert("Preencha a descrição e o valor");
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
          description: novo.descricao,
          amount: Number(novo.valor),
          expense_date: novo.data,
          category: novo.categoria,
          notes: null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.message || "Erro ao adicionar gasto");
        return;
      }

      setNovo({ descricao: "", valor: 0, categoria: "mercado", data: hoje });
      fetchGastos();
      alert("Gasto adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar gasto:", error);
      alert("Erro ao conectar com o servidor");
    }
  };

  const removerGasto = async (id: number) => {
    if (!confirm("Remover esse lançamento?")) return;

    try {
      const response = await fetch(`http://localhost:8000/api/expenses/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        alert("Erro ao remover gasto");
        return;
      }

      fetchGastos();
      alert("Gasto removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover gasto:", error);
      alert("Erro ao conectar com o servidor");
    }
  };

  // Filtrar por categoria
  const gastosFiltrados = filtroCategoria
    ? gastos.filter((g) => g.category === filtroCategoria)
    : gastos;

  // Agrupar gastos por data
  const gastosPorData = gastosFiltrados.reduce((acc: any, gasto) => {
    const data = gasto.expense_date;
    if (!acc[data]) {
      acc[data] = [];
    }
    acc[data].push(gasto);
    return acc;
  }, {});

  // Calcular total por data
  const totalPorData = Object.keys(gastosPorData).reduce((acc: any, data) => {
    acc[data] = gastosPorData[data].reduce(
      (sum: number, g: Expense) => sum + g.amount,
      0,
    );
    return acc;
  }, {});

  // Total geral do mês
  const totalGeral = gastosFiltrados.reduce((sum, g) => sum + g.amount, 0);

  const getCategoriaInfo = (categoriaValue: string) => {
    return (
      categorias.find((c) => c.value === categoriaValue) ||
      categorias[categorias.length - 1]
    );
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "360px 1fr",
        height: "100%",
        background: "#FAFAFA",
      }}
    >
      {/* 🔹 SIDEBAR - NOVO GASTO */}
      <div
        style={{
          background: "#1f2937",
          color: "#fff",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <div style={{ padding: "20px", borderBottom: "1px solid #374151" }}>
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 600,
              color: "#fff",
            }}
          >
            💸 Novo Gasto
          </h2>
        </div>

        <div style={{ padding: "20px" }}>
          {/* DATA */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: 12,
                fontWeight: 500,
                color: "#9ca3af",
              }}
            >
              Data:
            </label>
            <input
              type="date"
              value={novo.data}
              onChange={(e) => setNovo({ ...novo, data: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #374151",
                background: "#374151",
                color: "#fff",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          {/* DESCRIÇÃO */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: 12,
                fontWeight: 500,
                color: "#9ca3af",
              }}
            >
              Descrição:
            </label>
            <input
              placeholder="Ex: Compra de insumos"
              value={novo.descricao}
              onChange={(e) => setNovo({ ...novo, descricao: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #374151",
                background: "#374151",
                color: "#fff",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          {/* CATEGORIA */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: 12,
                fontWeight: 500,
                color: "#9ca3af",
              }}
            >
              Categoria:
            </label>
            <select
              value={novo.categoria}
              onChange={(e) => setNovo({ ...novo, categoria: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #374151",
                background: "#374151",
                color: "#fff",
                fontSize: 14,
                outline: "none",
                cursor: "pointer",
              }}
            >
              {categorias.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* VALOR */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: 12,
                fontWeight: 500,
                color: "#9ca3af",
              }}
            >
              Valor (R$):
            </label>
            <input
              type="text"
              placeholder="0,00"
              value={
                novo.valor === 0
                  ? ""
                  : novo.valor.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
              }
              onChange={(e) => {
                let value = e.target.value;
                value = value.replace(/\D/g, "");
                const cents = parseInt(value, 10);
                if (isNaN(cents)) {
                  setNovo({ ...novo, valor: 0 });
                  return;
                }
                const realValue = cents / 100;
                setNovo({ ...novo, valor: realValue });
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #374151",
                background: "#374151",
                color: "#fff",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          {/* BOTÃO */}
          <button
            onClick={adicionarGasto}
            style={{
              width: "100%",
              padding: "10px",
              background: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 14,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#059669")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#10b981")}
          >
            + Lançar Gasto
          </button>
        </div>
      </div>

      {/* 🔹 CONTEÚDO - LISTA DE GASTOS DO MÊS */}
      <div
        style={{
          padding: "20px",
          overflowY: "auto",
          height: "100vh",
        }}
      >
        {/* HEADER COM FILTROS DE MÊS/ANO */}
        <div
          style={{
            background: "#fff",
            padding: "16px 20px",
            borderRadius: 8,
            marginBottom: 20,
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#333",
                }}
              >
                📊 Gastos do Mês
              </h2>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <select
                value={mesSelecionado}
                onChange={(e) => setMesSelecionado(Number(e.target.value))}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  fontSize: 14,
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
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  fontSize: 14,
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
          <div style={{ marginTop: 12, textAlign: "right" }}>
            <span style={{ fontSize: 14, color: "#6b7280" }}>
              Total do mês:{" "}
            </span>
            <span
              style={{ fontSize: 20, fontWeight: "bold", color: "#dc2626" }}
            >
              {formatCurrency(totalGeral)}
            </span>
          </div>
        </div>

        {/* FILTRO POR CATEGORIA */}
        <div
          style={{
            background: "#fff",
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 16,
            border: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
            Filtrar por categoria:
          </span>
          <button
            onClick={() => setFiltroCategoria("")}
            style={{
              padding: "4px 12px",
              borderRadius: 20,
              border: "1px solid #e5e7eb",
              background: filtroCategoria === "" ? "#10b981" : "#fff",
              color: filtroCategoria === "" ? "#fff" : "#374151",
              cursor: "pointer",
              fontSize: 12,
              transition: "all 0.2s",
            }}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFiltroCategoria(cat.value)}
              style={{
                padding: "4px 12px",
                borderRadius: 20,
                border: `1px solid ${cat.color}`,
                background: filtroCategoria === cat.value ? cat.color : "#fff",
                color: filtroCategoria === cat.value ? "#fff" : cat.color,
                cursor: "pointer",
                fontSize: 12,
                transition: "all 0.2s",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* LISTA DE GASTOS AGRUPADA POR DATA */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              background: "#fff",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              color: "#9ca3af",
            }}
          >
            Carregando...
          </div>
        ) : Object.keys(gastosPorData).length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              background: "#fff",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              color: "#9ca3af",
              fontSize: 14,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>💰</div>
            <p>Nenhum gasto registrado neste mês</p>
          </div>
        ) : (
          Object.keys(gastosPorData)
            .sort((a, b) => b.localeCompare(a))
            .map((data) => (
              <div key={data} style={{ marginBottom: 24 }}>
                {/* CABEÇALHO DO DIA */}
                <div
                  style={{
                    background: "#f3f4f6",
                    padding: "10px 16px",
                    borderRadius: 8,
                    marginBottom: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    📅 {formatDate(data)}
                  </h3>
                  <span
                    style={{ fontSize: 14, fontWeight: 600, color: "#dc2626" }}
                  >
                    Total: {formatCurrency(totalPorData[data])}
                  </span>
                </div>

                {/* TABELA DO DIA */}
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      background: "#fff",
                      borderRadius: 8,
                      borderCollapse: "collapse",
                      overflow: "hidden",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                      marginBottom: 16,
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
                            padding: "12px 16px",
                            textAlign: "left",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#374151",
                          }}
                        >
                          Descrição
                        </th>
                        <th
                          style={{
                            padding: "12px 16px",
                            textAlign: "left",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#374151",
                          }}
                        >
                          Categoria
                        </th>
                        <th
                          style={{
                            padding: "12px 16px",
                            textAlign: "right",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#374151",
                          }}
                        >
                          Valor
                        </th>
                        <th
                          style={{
                            padding: "12px 16px",
                            textAlign: "center",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#374151",
                          }}
                        >
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {gastosPorData[data].map((g: Expense) => {
                        const categoriaInfo = getCategoriaInfo(g.category);
                        return (
                          <tr
                            key={g.id}
                            style={{
                              borderBottom: "1px solid #f0f0f0",
                              transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#f9fafb";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <td
                              style={{
                                padding: "12px 16px",
                                fontSize: 14,
                                fontWeight: 500,
                                color: "#333",
                                maxWidth: "300px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={g.description}
                            >
                              {g.description}
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "4px 10px",
                                  borderRadius: 20,
                                  fontSize: 11,
                                  fontWeight: 500,
                                  background: `${categoriaInfo.color}15`,
                                  color: categoriaInfo.color,
                                }}
                              >
                                {categoriaInfo.label}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "12px 16px",
                                textAlign: "right",
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#dc2626",
                              }}
                            >
                              {formatCurrency(g.amount)}
                            </td>
                            <td
                              style={{
                                padding: "12px 16px",
                                textAlign: "center",
                              }}
                            >
                              <button
                                onClick={() => removerGasto(g.id)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#9ca3af",
                                  fontSize: 16,
                                  cursor: "pointer",
                                  padding: "4px 8px",
                                  borderRadius: 4,
                                  transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = "#dc2626";
                                  e.currentTarget.style.background = "#fee2e2";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = "#9ca3af";
                                  e.currentTarget.style.background = "none";
                                }}
                                title="Remover"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
