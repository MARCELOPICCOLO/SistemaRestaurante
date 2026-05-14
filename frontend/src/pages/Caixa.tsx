import { useState, useEffect, useCallback } from "react";
import { SidebarCaixa } from "../../components/SidebarCaixa";
import { TabelaGastos } from "../../components/TabelaGastos";
import { HeaderCaixa } from "../../components/HeaderCaixa";
import { FiltrosCaixa } from "../../components/FiltrosCaixa";
import { ModalAdicionarCategoria } from "../../components/ModalAdicionarCategoria";
import { ModalAdicionarSaida } from "../../components/ModalAdicionarSaida";
import { ModalGerenciarCategorias } from "../../components/ModalGerenciarCategorias";
import { ModalImportarGastos } from "../../components/ModalImportarGastos";
import { ModalImportarVendas } from "../../components/ModalImportarVendas";

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

  const [showModalImportarGastos, setShowModalImportarGastos] = useState(false);
  const [showModalImportarVendas, setShowModalImportarVendas] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);

  // Buscar categorias
  const fetchCategorias = useCallback(async () => {
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
  }, [novaSaida.category_id]);

  // Buscar entradas (vendas do PDV)
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

  // Buscar saídas (gastos)
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

  // Buscar todas as transações
  const fetchTransacoes = useCallback(async () => {
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
  }, [fetchEntradas, fetchSaidas]);

  // Efeito para carregar categorias uma vez
  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  // Efeito para carregar transações quando categorias, ano ou mês mudarem
  useEffect(() => {
    if (categorias.length > 0) {
      fetchTransacoes();
    }
  }, [anoSelecionado, mesSelecionado, categorias, fetchTransacoes]);

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

  // Processar arquivo CSV
  const processCSV = (file: File, callback: (data: any[]) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n");

      const firstLine = lines[0].toLowerCase();
      const hasHeader =
        firstLine.includes("descricao") ||
        firstLine.includes("description") ||
        firstLine.includes("data") ||
        firstLine.includes("valor") ||
        firstLine.includes("cliente");

      let headers: string[] = [];
      let startRow = 0;

      if (hasHeader) {
        headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
        startRow = 1;
      } else {
        headers = ["data", "descricao", "valor"];
        startRow = 0;
      }

      const data = [];
      for (let i = startRow; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values: string[] = [];
        let inQuotes = false;
        let currentValue = "";

        for (let j = 0; j < lines[i].length; j++) {
          const char = lines[i][j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            values.push(currentValue.trim());
            currentValue = "";
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue.trim());

        const row: any = {};
        headers.forEach((header, index) => {
          if (index < values.length) {
            row[header] = values[index];
          }
        });

        if (!hasHeader && Object.keys(row).length === 3) {
          row.data = values[0];
          row.descricao = values[1];
          row.valor = values[2];
        }

        data.push(row);
      }

      callback(data);
    };
    reader.readAsText(file, "UTF-8");
  };

  // Função para converter data brasileira (DD/MM/YYYY) para formato ISO (YYYY-MM-DD)
  const parseBrazilianDate = (dateStr: string): string => {
    if (!dateStr) return "";

    const cleanDate = dateStr.trim();

    if (cleanDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return cleanDate;
    }

    if (cleanDate.includes("/")) {
      const parts = cleanDate.split("/");
      if (parts.length === 3) {
        let day = parts[0].padStart(2, "0");
        let month = parts[1].padStart(2, "0");
        let year = parts[2];

        if (year.length === 2) {
          year = "20" + year;
        }

        return `${year}-${month}-${day}`;
      }
    }

    return cleanDate;
  };

  // Importar gastos do CSV
  const importarGastosCSV = async () => {
    if (!importFile) {
      alert("Selecione um arquivo CSV");
      return;
    }

    setImporting(true);
    processCSV(importFile, async (data) => {
      let sucesso = 0;
      let erros = 0;

      for (const row of data) {
        try {
          const description = row.descricao || row.description || row.Descricao;
          const amount = parseFloat(row.valor || row.amount || row.Valor);
          let dateStr = row.data || row.date || row.Data;
          const categoryName = row.categoria || row.category || row.Categoria;

          if (!description || isNaN(amount) || !dateStr) {
            erros++;
            continue;
          }

          const date = parseBrazilianDate(dateStr);

          if (!date) {
            erros++;
            continue;
          }

          const categoria = categorias.find(
            (c) => c.name.toLowerCase() === categoryName?.toLowerCase(),
          );

          const response = await fetch("http://localhost:8000/api/expenses", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              restaurant_id: 1,
              description: description,
              amount: amount,
              expense_date: date,
              category_id: categoria?.id || categorias[0]?.id || 1,
              type: "saida",
              notes: `Importado via CSV em ${new Date().toLocaleString()}. Original: ${dateStr}`,
            }),
          });

          if (response.ok) {
            sucesso++;
          } else {
            erros++;
          }
        } catch (error) {
          erros++;
        }
      }

      alert(
        `Importação concluída!\n✅ Sucesso: ${sucesso}\n❌ Erros: ${erros}`,
      );
      setShowModalImportarGastos(false);
      setImportFile(null);
      setImportPreview([]);
      fetchTransacoes();
      setImporting(false);
    });
  };

  // Importar vendas do CSV
  const importarVendasCSV = async () => {
    if (!importFile) {
      alert("Selecione um arquivo CSV");
      return;
    }

    setImporting(true);
    processCSV(importFile, async (data) => {
      let sucesso = 0;
      let erros = 0;

      for (const row of data) {
        try {
          const customerName =
            row.cliente || row.customer_name || row.Cliente || "Cliente CSV";
          const amount = parseFloat(
            row.valor || row.total || row.Valor || row.Total,
          );
          let dateStr = row.data || row.date || row.Data;
          const paymentMethod =
            row.pagamento || row.payment_method || row.Pagamento || "dinheiro";

          if (isNaN(amount) || !dateStr) {
            erros++;
            continue;
          }

          const date = parseBrazilianDate(dateStr);

          if (!date) {
            erros++;
            continue;
          }

          const response = await fetch("http://localhost:8000/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              restaurant_id: 1,
              table_id: 1,
              customer_name: customerName,
              status: "fechado",
              total: amount,
              payment_method: paymentMethod,
              closed_at: date,
            }),
          });

          if (response.ok) {
            sucesso++;
          } else {
            erros++;
          }
        } catch (error) {
          erros++;
        }
      }

      alert(
        `Importação concluída!\n✅ Sucesso: ${sucesso}\n❌ Erros: ${erros}`,
      );
      setShowModalImportarVendas(false);
      setImportFile(null);
      setImportPreview([]);
      fetchTransacoes();
      setImporting(false);
    });
  };

  // Visualizar preview do CSV
  const previewCSV = (file: File) => {
    processCSV(file, (data) => {
      const formattedData = data.slice(0, 5).map((row) => ({
        ...row,
        data_original: row.data || row.date || row.Data,
        data_convertida: parseBrazilianDate(row.data || row.date || row.Data),
      }));
      setImportPreview(formattedData);
    });
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

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        height: "100%",
        background: "#FAFAFA",
      }}
    >
      <SidebarCaixa
        setShowModalSaida={setShowModalSaida}
        setShowModalGerenciar={setShowModalGerenciar}
        setShowModalImportarGastos={setShowModalImportarGastos}
        setShowModalImportarVendas={setShowModalImportarVendas}
      />

      {/* CONTEÚDO */}
      <div style={{ padding: "20px", overflowY: "auto", height: "100vh" }}>
        <HeaderCaixa
          mesSelecionado={mesSelecionado}
          setMesSelecionado={setMesSelecionado}
          anoSelecionado={anoSelecionado}
          setAnoSelecionado={setAnoSelecionado}
          showEntradas={showEntradas}
          setShowEntradas={setShowEntradas}
          showSaidas={showSaidas}
          setShowSaidas={setShowSaidas}
          totalEntradas={totalEntradas}
          totalSaidas={totalSaidas}
          saldoGeral={saldoGeral}
          formatCurrency={formatCurrency}
          anos={anos}
          meses={meses}
        />

        <FiltrosCaixa
          categorias={categorias}
          filtroCategoria={filtroCategoria}
          setFiltroCategoria={setFiltroCategoria}
        />

        <TabelaGastos
          transacoesPorData={transacoesPorData}
          diasExpandidos={diasExpandidos}
          totalEntradasPorData={totalEntradasPorData}
          totalSaidasPorData={totalSaidasPorData}
          saldoPorData={saldoPorData}
          loading={loading}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
          toggleDia={toggleDia}
          removerTransacao={removerTransacao}
        />
      </div>

      {/* MODAIS */}
      {showModalGerenciar && (
        <ModalGerenciarCategorias
          showModalGerenciar={showModalGerenciar}
          setShowModalGerenciar={setShowModalGerenciar}
          categorias={categorias}
          editandoCategoria={editandoCategoria}
          setEditandoCategoria={setEditandoCategoria}
          transacoes={transacoes}
          editarCategoria={editarCategoria}
          excluirCategoria={excluirCategoria}
          setShowModalCategoria={setShowModalCategoria}
        />
      )}

      <ModalAdicionarCategoria
        showModalCategoria={showModalCategoria}
        setShowModalCategoria={setShowModalCategoria}
        novaCategoria={novaCategoria}
        setNovaCategoria={setNovaCategoria}
        cores={cores}
        adicionarCategoria={adicionarCategoria}
      />

      <ModalAdicionarSaida
        showModalSaida={showModalSaida}
        setShowModalSaida={setShowModalSaida}
        novaSaida={novaSaida}
        setNovaSaida={setNovaSaida}
        categorias={categorias}
        adicionarSaida={adicionarSaida}
      />

      <ModalImportarGastos
        showModalImportarGastos={showModalImportarGastos}
        setShowModalImportarGastos={setShowModalImportarGastos}
        importFile={importFile}
        setImportFile={setImportFile}
        importPreview={importPreview}
        importing={importing}
        previewCSV={previewCSV}
        importarGastosCSV={importarGastosCSV}
      />

      <ModalImportarVendas
        showModalImportarVendas={showModalImportarVendas}
        setShowModalImportarVendas={setShowModalImportarVendas}
        importFile={importFile}
        setImportFile={setImportFile}
        importPreview={importPreview}
        importing={importing}
        previewCSV={previewCSV}
        importarVendasCSV={importarVendasCSV}
      />
    </div>
  );
}
