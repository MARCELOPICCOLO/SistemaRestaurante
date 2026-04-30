import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function Relatorio() {
  const hoje = new Date();

  const [modo, setModo] = useState<"mensal" | "anual">("mensal");
  const [mes, setMes] = useState(hoje.toISOString().slice(0, 7));
  const [ano, setAno] = useState(String(hoje.getFullYear()));

  // 🔥 MOCK (depois você liga com PDV + Caixa)
  const dados = [
    { data: "2026-04-01", vendas: 500, gastos: 200 },
    { data: "2026-04-02", vendas: 800, gastos: 300 },
    { data: "2026-04-03", vendas: 300, gastos: 400 },
    { data: "2026-05-01", vendas: 900, gastos: 500 },
    { data: "2026-05-10", vendas: 600, gastos: 200 },
  ];

  // 🔥 PROCESSAMENTO
  let dadosFiltrados: any[] = [];

  if (modo === "mensal") {
    dadosFiltrados = dados
      .filter((d) => d.data.startsWith(mes))
      .map((d) => ({
        name: d.data.split("-")[2], // dia
        vendas: d.vendas,
        gastos: d.gastos,
        lucro: d.vendas - d.gastos,
      }));
  } else {
    const agrupado: any = {};

    dados
      .filter((d) => d.data.startsWith(ano))
      .forEach((d) => {
        const mes = d.data.slice(5, 7);

        if (!agrupado[mes]) {
          agrupado[mes] = { vendas: 0, gastos: 0 };
        }

        agrupado[mes].vendas += d.vendas;
        agrupado[mes].gastos += d.gastos;
      });

    dadosFiltrados = Object.entries(agrupado).map(([mes, val]: any) => ({
      name: mes,
      vendas: val.vendas,
      gastos: val.gastos,
      lucro: val.vendas - val.gastos,
    }));
  }

  // 🔥 TOTAIS
  const totalVendas = dadosFiltrados.reduce((s, d) => s + d.vendas, 0);
  const totalGastos = dadosFiltrados.reduce((s, d) => s + d.gastos, 0);
  const lucro = totalVendas - totalGastos;

  return (
    <div style={{ padding: 20, background: "#f5f5f5", height: "100%" }}>
      {/* HEADER */}
      <div style={card}>
        <h2>📊 Relatório</h2>

        {/* MODO */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setModo("mensal")}>📅 Mensal</button>
          <button onClick={() => setModo("anual")}>📆 Anual</button>
        </div>

        {/* FILTRO */}
        <div style={{ marginTop: 10 }}>
          {modo === "mensal" ? (
            <input
              type="month"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
            />
          ) : (
            <input
              type="number"
              value={ano}
              onChange={(e) => setAno(e.target.value)}
            />
          )}
        </div>
      </div>

      {/* RESUMO */}
      <div style={grid}>
        <Resumo titulo="💰 Vendas" valor={totalVendas} cor="#4caf50" />
        <Resumo titulo="💸 Gastos" valor={totalGastos} cor="#e53935" />
        <Resumo
          titulo="📊 Lucro"
          valor={lucro}
          cor={lucro >= 0 ? "#2e7d32" : "#c62828"}
        />
      </div>

      {/* GRÁFICO */}
      <div style={{ ...card, height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dadosFiltrados}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Bar dataKey="vendas" fill="#4caf50" />
            <Bar dataKey="gastos" fill="#e53935" />
            <Bar dataKey="lucro" fill="#2196f3" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* LISTA */}
      <div style={{ marginTop: 20 }}>
        {dadosFiltrados.map((d, i) => (
          <div key={i} style={linha}>
            <strong>{d.name}</strong>

            <div style={{ display: "flex", gap: 20 }}>
              <span style={{ color: "#4caf50" }}>+ R$ {d.vendas}</span>

              <span style={{ color: "#e53935" }}>- R$ {d.gastos}</span>

              <span
                style={{
                  fontWeight: "bold",
                  color: d.lucro >= 0 ? "#2e7d32" : "#c62828",
                }}
              >
                R$ {d.lucro}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 🔧 COMPONENTES

function Resumo({ titulo, valor, cor }: any) {
  return (
    <div
      style={{
        background: "#fff",
        padding: 15,
        borderRadius: 10,
        borderTop: `5px solid ${cor}`,
      }}
    >
      <h3>{titulo}</h3>
      <p>R$ {valor}</p>
    </div>
  );
}

const card = {
  background: "#fff",
  padding: 15,
  borderRadius: 10,
  marginBottom: 20,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 10,
  marginBottom: 20,
};

const linha = {
  background: "#fff",
  padding: 12,
  borderRadius: 10,
  marginBottom: 10,
  display: "flex",
  justifyContent: "space-between",
};
