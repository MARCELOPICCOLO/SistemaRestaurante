import { useState } from "react";

export default function Caixa() {
  const hoje = new Date().toISOString().split("T")[0];

  const [dataSelecionada, setDataSelecionada] = useState(hoje);

  const [gastos, setGastos] = useState([
    {
      id: 1,
      descricao: "Compra de batata",
      valor: 150,
      data: hoje,
    },
    {
      id: 2,
      descricao: "Fornecedor chopp",
      valor: 300,
      data: hoje,
    },
  ]);

  const [novo, setNovo] = useState({
    descricao: "",
    valor: 0,
  });

  const adicionarGasto = () => {
    if (!novo.descricao || novo.valor <= 0) return;

    setGastos([
      ...gastos,
      {
        ...novo,
        id: Date.now(),
        data: dataSelecionada,
      },
    ]);

    setNovo({ descricao: "", valor: 0 });
  };

  const removerGasto = (id: number) => {
    if (confirm("Remover esse lançamento?")) {
      setGastos(gastos.filter((g) => g.id !== id));
    }
  };

  // 🔥 FILTRO POR DATA
  const gastosDoDia = gastos.filter((g) => g.data === dataSelecionada);

  const total = gastosDoDia.reduce((sum, g) => sum + g.valor, 0);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 2fr",
        height: "100%",
      }}
    >
      {/* 🔹 SIDEBAR */}
      <div
        style={{
          background: "#111",
          color: "#fff",
          padding: 20,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2>💸 Novo Gasto</h2>

        {/* DATA */}
        <input
          type="date"
          value={dataSelecionada}
          onChange={(e) => setDataSelecionada(e.target.value)}
          style={{
            width: "100%",
            marginBottom: 10,
            padding: 8,
            borderRadius: 6,
            border: "none",
          }}
        />

        {/* DESCRIÇÃO */}
        <input
          placeholder="Descrição"
          value={novo.descricao}
          onChange={(e) => setNovo({ ...novo, descricao: e.target.value })}
          style={{
            width: "100%",
            marginBottom: 10,
            padding: 8,
            borderRadius: 6,
            border: "none",
          }}
        />

        {/* VALOR */}
        <input
          type="number"
          placeholder="Valor"
          value={novo.valor}
          onChange={(e) => setNovo({ ...novo, valor: Number(e.target.value) })}
          style={{
            width: "100%",
            marginBottom: 10,
            padding: 8,
            borderRadius: 6,
            border: "none",
          }}
        />

        {/* BOTÃO */}
        <button
          onClick={adicionarGasto}
          style={{
            width: "100%",
            padding: 10,
            background: "#e53935",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          + Lançar Gasto
        </button>
      </div>

      {/* 🔹 CONTEÚDO */}
      <div
        style={{
          padding: 20,
          overflowY: "auto",
          background: "#f5f5f5",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            background: "#fff",
            padding: 15,
            borderRadius: 12,
            marginBottom: 20,
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ margin: 0 }}>📊 Caixa do dia</h2>
          <p style={{ color: "#666", marginTop: 5 }}>{dataSelecionada}</p>
        </div>

        {/* LISTA */}
        {gastosDoDia.length === 0 && (
          <p style={{ color: "#777" }}>Nenhum gasto neste dia</p>
        )}

        {gastosDoDia.map((g) => (
          <div
            key={g.id}
            style={{
              background: "#fff",
              padding: 12,
              marginBottom: 10,
              borderRadius: 10,
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            {/* LINHA PRINCIPAL */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong>{g.descricao}</strong>

              <span style={{ color: "#e53935", fontWeight: "bold" }}>
                - R$ {g.valor}
              </span>
            </div>

            {/* AÇÕES */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 8,
              }}
            >
              <button
                onClick={() => removerGasto(g.id)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ff5252",
                  fontSize: 18,
                  cursor: "pointer",
                }}
                title="Remover"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}

        {/* TOTAL */}
        <div
          style={{
            marginTop: 20,
            paddingTop: 10,
            borderTop: "2px solid #ddd",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          <span>Total</span>
          <span style={{ color: "#e53935" }}>R$ {total}</span>
        </div>
      </div>
    </div>
  );
}
