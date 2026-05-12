import { useState, useEffect } from "react";

interface Expense {
  id: number;
  description: string;
  amount: number;
  expense_date: string;
  category_id: number;
  category?: ExpenseCategory;
  notes: string | null;
}

interface ExpenseCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
  is_active: boolean;
}

export default function Caixa() {
  const hoje = new Date().toISOString().split("T")[0];
  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth() + 1;

  const [anoSelecionado, setAnoSelecionado] = useState(anoAtual);
  const [mesSelecionado, setMesSelecionado] = useState(mesAtual);
  const [gastos, setGastos] = useState<Expense[]>([]);
  const [categorias, setCategorias] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [diasExpandidos, setDiasExpandidos] = useState<{
    [key: string]: boolean;
  }>({});

  // Estados para modais
  const [showModalGerenciar, setShowModalGerenciar] = useState(false);
  const [showModalCategoria, setShowModalCategoria] = useState(false);
  const [editandoCategoria, setEditandoCategoria] =
    useState<ExpenseCategory | null>(null);

  const [novaCategoria, setNovaCategoria] = useState({
    name: "",
    icon: "📌",
    color: "#6b7280",
  });

  const [novo, setNovo] = useState({
    descricao: "",
    valor: 0,
    category_id: 0,
    data: hoje,
  });

  const [filtroCategoria, setFiltroCategoria] = useState<number | null>(null);

  // Cores predefinidas
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

  // Ícones comuns
  const icones = [
    "📌",
    "🥩",
    "🛒",
    "💧",
    "⚡",
    "🔥",
    "🍺",
    "📦",
    "⛽",
    "🥬",
    "🍞",
    "🧀",
    "🥛",
    "🍗",
    "🐟",
    "🍎",
    "🚗",
    "💊",
    "🧹",
    "📱",
  ];

  // Buscar categorias da API
  const fetchCategorias = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/expense-categories?restaurant_id=1",
      );
      if (!response.ok) throw new Error("Erro ao buscar categorias");
      const data = await response.json();
      setCategorias(data);

      if (data.length > 0 && novo.category_id === 0) {
        setNovo((prev) => ({ ...prev, category_id: data[0].id }));
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  // Buscar gastos da API
  const fetchGastos = async () => {
    setLoading(true);
    try {
      const startDate = `${anoSelecionado}-${String(mesSelecionado).padStart(2, "0")}-01`;
      const lastDay = new Date(anoSelecionado, mesSelecionado, 0).getDate();
      const endDate = `${anoSelecionado}-${String(mesSelecionado).padStart(2, "0")}-${lastDay}`;

      const url = `http://localhost:8000/api/expenses?restaurant_id=1&start_date=${startDate}&end_date=${endDate}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error("Erro ao buscar gastos");

      const data = await response.json();

      const gastosFormatados = data.map((gasto: any) => {
        const categoria = categorias.find((c) => c.id === gasto.category_id);
        return {
          id: gasto.id,
          description: gasto.description,
          amount: Number(gasto.amount) || 0,
          expense_date: gasto.expense_date,
          category_id: gasto.category_id,
          category: categoria,
          notes: gasto.notes,
        };
      });

      gastosFormatados.sort((a: Expense, b: Expense) =>
        b.expense_date.localeCompare(a.expense_date),
      );

      setGastos(gastosFormatados);

      const diasUnicos = [
        ...new Set(
          gastosFormatados.map((g: Expense) => g.expense_date.split("T")[0]),
        ),
      ];
      const novosExpandidos: { [key: string]: boolean } = {};
      diasUnicos.forEach((data) => {
        if (diasExpandidos[data] === undefined) {
          novosExpandidos[data] = true;
        }
      });
      setDiasExpandidos((prev) => ({ ...prev, ...novosExpandidos }));
    } catch (error) {
      console.error("Erro ao buscar gastos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  useEffect(() => {
    if (categorias.length > 0) {
      fetchGastos();
    }
  }, [anoSelecionado, mesSelecionado, categorias]);

  // Adicionar categoria
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

  // Editar categoria
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

  // Excluir categoria
  const excluirCategoria = async (id: number, name: string) => {
    const temGastos = gastos.some((g) => g.category_id === id);

    if (temGastos) {
      if (
        !confirm(
          `A categoria "${name}" possui gastos associados. Excluir mesmo assim? Os gastos ficarão sem categoria.`,
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

  const adicionarGasto = async () => {
    if (!novo.descricao || novo.valor <= 0) {
      alert("Preencha a descrição e o valor");
      return;
    }

    if (!novo.category_id) {
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
          description: novo.descricao,
          amount: Number(novo.valor),
          expense_date: novo.data,
          category_id: novo.category_id,
          notes: null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.message || "Erro ao adicionar gasto");
        return;
      }

      setNovo({
        descricao: "",
        valor: 0,
        category_id: categorias[0]?.id || 0,
        data: hoje,
      });
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

  const toggleDia = (data: string) => {
    setDiasExpandidos((prev) => ({ ...prev, [data]: !prev[data] }));
  };

  const formatCurrency = (value: any): string => {
    const number = typeof value === "number" ? value : Number(value) || 0;
    return `R$ ${number.toFixed(2)}`;
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "-";
    return dateString.split("T")[0].split("-").reverse().join("/");
  };

  const gastosFiltrados = filtroCategoria
    ? gastos.filter((g) => g.category_id === filtroCategoria)
    : gastos;

  const gastosPorData = gastosFiltrados.reduce((acc: any, gasto) => {
    const data = gasto.expense_date.split("T")[0];
    if (!acc[data]) acc[data] = [];
    acc[data].push(gasto);
    return acc;
  }, {});

  const totalPorData = Object.keys(gastosPorData).reduce((acc: any, data) => {
    acc[data] = gastosPorData[data].reduce(
      (sum: number, g: Expense) => sum + g.amount,
      0,
    );
    return acc;
  }, {});

  const totalGeral = gastosFiltrados.reduce((sum, g) => sum + g.amount, 0);

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

  // Modal de adicionar categoria
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
        zIndex: 1001,
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
        <h2 style={{ margin: "0 0 20px 0", fontSize: 20 }}>
          ➕ Nova Categoria
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
            Ícone:
          </label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 8,
            }}
          >
            {icones.map((icone) => (
              <button
                key={icone}
                onClick={() =>
                  setNovaCategoria({ ...novaCategoria, icon: icone })
                }
                style={{
                  width: 40,
                  height: 40,
                  fontSize: 24,
                  background:
                    novaCategoria.icon === icone ? "#10b981" : "#f3f4f6",
                  border:
                    novaCategoria.icon === icone
                      ? "2px solid #10b981"
                      : "1px solid #e5e7eb",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                {icone}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Ou digite um ícone (ex: 🚗)"
            value={novaCategoria.icon}
            onChange={(e) =>
              setNovaCategoria({ ...novaCategoria, icon: e.target.value })
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

        <div style={{ marginBottom: 20 }}>
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
                      ? "3px solid #fff"
                      : "1px solid #e5e7eb",
                  borderRadius: 8,
                  cursor: "pointer",
                  boxShadow:
                    novaCategoria.color === cor ? "0 0 0 2px #10b981" : "none",
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

  // Modal de gerenciar categorias
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
          <h2 style={{ margin: 0, fontSize: 20 }}>📋 Gerenciar Categorias</h2>
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
                    type="text"
                    value={editandoCategoria.icon}
                    onChange={(e) =>
                      setEditandoCategoria({
                        ...editandoCategoria,
                        icon: e.target.value,
                      })
                    }
                    style={{
                      width: 60,
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid #e5e7eb",
                      textAlign: "center",
                    }}
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
                    <span style={{ fontSize: 24 }}>{cat.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>
                      {cat.name}
                    </span>
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        background: cat.color,
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    {gastos.some((g) => g.category_id === cat.id) && (
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
        gridTemplateColumns: "360px 1fr",
        height: "100%",
        background: "#FAFAFA",
      }}
    >
      {/* SIDEBAR - NOVO GASTO */}
      <div
        style={{
          background: "#1f2937",
          color: "#fff",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <div style={{ padding: "20px", borderBottom: "1px solid #374151" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <label
                style={{ fontSize: 12, fontWeight: 500, color: "#9ca3af" }}
              >
                Categoria:
              </label>
              <button
                onClick={() => setShowModalGerenciar(true)}
                style={{
                  fontSize: 11,
                  background: "none",
                  border: "none",
                  color: "#10b981",
                  cursor: "pointer",
                }}
              >
                ⚙️ Gerenciar
              </button>
            </div>
            <select
              value={novo.category_id}
              onChange={(e) =>
                setNovo({ ...novo, category_id: Number(e.target.value) })
              }
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
              <option value={0}>Selecione uma categoria</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
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
                let value = e.target.value.replace(/\D/g, "");
                const cents = parseInt(value, 10);
                if (isNaN(cents)) setNovo({ ...novo, valor: 0 });
                else setNovo({ ...novo, valor: cents / 100 });
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
            }}
          >
            + Lançar Gasto
          </button>
        </div>
      </div>

      {/* CONTEÚDO - LISTA DE GASTOS */}
      <div style={{ padding: "20px", overflowY: "auto", height: "100vh" }}>
        {/* HEADER */}
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
              gap: 16,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
              📊 Gastos do Mês
            </h2>
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
          <span style={{ fontSize: 13, fontWeight: 500 }}>
            Filtrar por categoria:
          </span>
          <button
            onClick={() => setFiltroCategoria(null)}
            style={{
              padding: "4px 12px",
              borderRadius: 20,
              border: "1px solid #e5e7eb",
              background: filtroCategoria === null ? "#10b981" : "#fff",
              color: filtroCategoria === null ? "#fff" : "#374151",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFiltroCategoria(cat.id)}
              style={{
                padding: "4px 12px",
                borderRadius: 20,
                border: `1px solid ${cat.color}`,
                background: filtroCategoria === cat.id ? cat.color : "#fff",
                color: filtroCategoria === cat.id ? "#fff" : cat.color,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* LISTA DE GASTOS AGRUPADA POR DATA */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            Carregando...
          </div>
        ) : Object.keys(gastosPorData).length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              background: "#fff",
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>💰</div>
            <p>Nenhum gasto registrado neste mês</p>
          </div>
        ) : (
          Object.keys(gastosPorData)
            .sort((a, b) => b.localeCompare(a))
            .map((data) => {
              const estaExpandido = diasExpandidos[data] !== false;
              const gastosDoDia = gastosPorData[data];
              const totalDia = totalPorData[data];

              return (
                <div key={data} style={{ marginBottom: 16 }}>
                  <div
                    onClick={() => toggleDia(data)}
                    style={{
                      background: estaExpandido ? "#f3f4f6" : "#fff",
                      padding: "12px 16px",
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <span style={{ fontSize: 18 }}>
                        {estaExpandido ? "▼" : "▶"}
                      </span>
                      <h3 style={{ margin: 0, fontSize: 15 }}>
                        📅 {formatDate(data)}
                      </h3>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>
                        ({gastosDoDia.length}{" "}
                        {gastosDoDia.length === 1 ? "item" : "itens"})
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#dc2626",
                      }}
                    >
                      Total: {formatCurrency(totalDia)}
                    </span>
                  </div>

                  {estaExpandido && (
                    <div style={{ marginTop: 8, overflowX: "auto" }}>
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
                                padding: "10px 16px",
                                textAlign: "left",
                              }}
                            >
                              Descrição
                            </th>
                            <th
                              style={{
                                padding: "10px 16px",
                                textAlign: "left",
                              }}
                            >
                              Categoria
                            </th>
                            <th
                              style={{
                                padding: "10px 16px",
                                textAlign: "right",
                              }}
                            >
                              Valor
                            </th>
                            <th
                              style={{
                                padding: "10px 16px",
                                textAlign: "center",
                              }}
                            >
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {gastosDoDia.map((g: Expense) => (
                            <tr
                              key={g.id}
                              style={{ borderBottom: "1px solid #f0f0f0" }}
                            >
                              <td
                                style={{ padding: "10px 16px" }}
                                title={g.description}
                              >
                                {g.description}
                              </td>
                              <td style={{ padding: "10px 16px" }}>
                                {g.category && (
                                  <span
                                    style={{
                                      display: "inline-block",
                                      padding: "2px 8px",
                                      borderRadius: 16,
                                      fontSize: 11,
                                      background: `${g.category.color}15`,
                                      color: g.category.color,
                                    }}
                                  >
                                    {g.category.icon} {g.category.name}
                                  </span>
                                )}
                              </td>
                              <td
                                style={{
                                  padding: "10px 16px",
                                  textAlign: "right",
                                  fontWeight: 600,
                                  color: "#dc2626",
                                }}
                              >
                                {formatCurrency(g.amount)}
                              </td>
                              <td
                                style={{
                                  padding: "10px 16px",
                                  textAlign: "center",
                                }}
                              >
                                <button
                                  onClick={() => removerGasto(g.id)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: 18,
                                    cursor: "pointer",
                                  }}
                                >
                                  🗑️
                                </button>
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

      {/* MODAIS */}
      {showModalGerenciar && <ModalGerenciarCategorias />}
      {showModalCategoria && <ModalAdicionarCategoria />}
    </div>
  );
}
