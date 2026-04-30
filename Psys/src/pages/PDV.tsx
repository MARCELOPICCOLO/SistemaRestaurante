import { useState } from "react";

export default function App() {
  const [mesaAtual, setMesaAtual] = useState("mesa-1");

  const [comandas, setComandas] = useState({
    "mesa-1": [],
    "mesa-2": [],
  });

  const [novaMesa, setNovaMesa] = useState("");

  const produtos = [
    { id: 1, nome: "Batata P", preco: 15, categoria: "Porções" },
    { id: 2, nome: "Batata M", preco: 23, categoria: "Porções" },
    { id: 3, nome: "Batata G", preco: 30, categoria: "Porções" },
    { id: 4, nome: "Chopp 300ml", preco: 10, categoria: "Bebidas" },
    { id: 5, nome: "Chopp 500ml", preco: 14, categoria: "Bebidas" },
  ];

  const categorias = [...new Set(produtos.map((p) => p.categoria))];

  const adicionarMesa = () => {
    if (!novaMesa) return;
    if (comandas[novaMesa]) return alert("Mesa já existe");

    setComandas({ ...comandas, [novaMesa]: [] });
    setMesaAtual(novaMesa);
    setNovaMesa("");
  };

  const removerMesa = (mesa) => {
    if (comandas[mesa].length > 0) {
      return alert("Não pode remover mesa com pedido");
    }

    const novas = { ...comandas };
    delete novas[mesa];

    setComandas(novas);

    if (mesa === mesaAtual) {
      const restantes = Object.keys(novas);
      setMesaAtual(restantes[0] || "");
    }
  };

  const addItem = (produto) => {
    const itensMesa = comandas[mesaAtual];
    const existente = itensMesa.find((i) => i.id === produto.id);

    let novosItens;

    if (existente) {
      novosItens = itensMesa.map((i) =>
        i.id === produto.id ? { ...i, qtd: i.qtd + 1 } : i,
      );
    } else {
      novosItens = [...itensMesa, { ...produto, qtd: 1 }];
    }

    setComandas({ ...comandas, [mesaAtual]: novosItens });
  };

  const alterarQtd = (id, delta) => {
    const itensMesa = comandas[mesaAtual];

    const novosItens = itensMesa.map((item) =>
      item.id === id ? { ...item, qtd: Math.max(1, item.qtd + delta) } : item,
    );

    setComandas({ ...comandas, [mesaAtual]: novosItens });
  };

  const removeItem = (id) => {
    const itensMesa = comandas[mesaAtual];
    const novosItens = itensMesa.filter((item) => item.id !== id);

    setComandas({ ...comandas, [mesaAtual]: novosItens });
  };

  const comanda = comandas[mesaAtual] || [];

  const total = comanda.reduce((sum, item) => sum + item.preco * item.qtd, 0);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 2fr 1fr",
        height: "100vh",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          background: "#111",
          color: "#fff",
          padding: 20,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h1>PDV</h1>
        <p>Mesa atual: {mesaAtual}</p>

        <div style={{ marginTop: 20 }}>
          <input
            value={novaMesa}
            onChange={(e) => setNovaMesa(e.target.value)}
            placeholder="Nome da mesa"
            style={{ padding: 5, marginRight: 5 }}
          />
          <button onClick={adicionarMesa}>+</button>
        </div>

        {/* Lista de mesas */}
        <div style={{ marginTop: 20, flex: 1, overflowY: "auto" }}>
          <strong>Mesas</strong>

          {Object.keys(comandas).map((mesa) => {
            const ocupada = comandas[mesa].length > 0;

            return (
              <div
                key={mesa}
                style={{
                  background: mesaAtual === mesa ? "#2e7d32" : "#1e1e1e",
                  padding: 10,
                  borderRadius: 10,
                  marginTop: 10,
                  boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <strong>{mesa}</strong>

                  {/* Indicador de comanda aberta */}
                  {ocupada && (
                    <span
                      style={{ color: "#ff9800", fontSize: 18 }}
                      title="Comanda aberta"
                    >
                      🍽️
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 10,
                  }}
                >
                  <button
                    onClick={() => setMesaAtual(mesa)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      border: "none",
                      background: "#4caf50",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    ▶
                  </button>

                  <button
                    onClick={() => removerMesa(mesa)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ff5252",
                      fontSize: 18,
                      cursor: "pointer",
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cardápio */}
      <div style={{ padding: 20, overflowY: "auto" }}>
        {categorias.map((cat) => (
          <div key={cat} style={{ marginBottom: 30 }}>
            <h2 style={{ marginBottom: 10 }}>{cat}</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {produtos
                .filter((p) => p.categoria === cat)
                .map((p) => (
                  <div
                    key={p.id}
                    onClick={() => addItem(p)}
                    style={{
                      border: "1px solid #ccc",
                      padding: 20,
                      cursor: "pointer",
                      borderRadius: 10,
                    }}
                  >
                    <h3>{p.nome}</h3>
                    <p>R$ {p.preco}</p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Comanda */}
      <div
        style={{
          background: "#f5f5f5",
          padding: 20,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2>Comanda ({mesaAtual})</h2>

        <div style={{ flex: 1, overflowY: "auto", marginTop: 10 }}>
          {comanda.length === 0 && <p>Nenhum item</p>}

          {comanda.map((item) => (
            <div
              key={item.id}
              style={{
                background: "#fff",
                padding: 10,
                borderRadius: 10,
                marginBottom: 10,
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{item.nome}</strong>
                <span>R$ {item.preco * item.qtd}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={() => alterarQtd(item.id, -1)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      border: "none",
                      background: "#ddd",
                      cursor: "pointer",
                    }}
                  >
                    −
                  </button>

                  <span>{item.qtd}</span>

                  <button
                    onClick={() => alterarQtd(item.id, 1)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      border: "none",
                      background: "#4caf50",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "red",
                    fontSize: 18,
                    cursor: "pointer",
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: "2px solid #ddd",
            paddingTop: 10,
            fontSize: 18,
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>Total</span>
          <span>R$ {total}</span>
        </div>
      </div>
    </div>
  );
}
