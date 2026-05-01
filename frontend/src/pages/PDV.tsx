import { useState, useEffect } from "react";

export default function App() {
  const [mesaAtual, setMesaAtual] = useState("mesa-1");

  const [comandas, setComandas] = useState({
    "mesa-1": [],
    "mesa-2": [],
  });

  const [novaMesa, setNovaMesa] = useState("");

  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const resProducts = await fetch(
          "http://localhost:8000/api/products?restaurant_id=1",
        );
        const productsData = await resProducts.json();

        const resCategories = await fetch(
          "http://localhost:8000/api/categories?restaurant_id=1",
        );
        const categoriesData = await resCategories.json();

        setProdutos(productsData);
        setCategorias(categoriesData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }

    loadData();
  }, []);

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
      novosItens = [
        ...itensMesa,
        {
          id: produto.id,
          name: produto.name,
          price: Number(produto.price),
          qtd: 1,
        },
      ];
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

  const total = comanda.reduce((sum, item) => sum + item.price * item.qtd, 0);

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
          background: "#FF6B00",
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

        <div style={{ marginTop: 20, flex: 1, overflowY: "auto" }}>
          <strong>Mesas</strong>

          {Object.keys(comandas).map((mesa) => {
            const ocupada = comandas[mesa].length > 0;

            return (
              <div
                key={mesa}
                style={{
                  background: mesaAtual === mesa ? "#E65C00" : "#FF8C42",
                  padding: 10,
                  borderRadius: 10,
                  marginTop: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <strong>{mesa}</strong>

                  {ocupada && <span style={{ color: "#FFD180" }}>🍽️</span>}
                </div>

                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <button
                    onClick={() => setMesaAtual(mesa)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      border: "none",
                      background: "#2C2C2C",
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
                      color: "#B00020",
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
      <div style={{ padding: 20, overflowY: "auto", background: "#FAFAFA" }}>
        {categorias.map((cat) => (
          <div key={cat.id} style={{ marginBottom: 30 }}>
            <h2 style={{ color: "#333" }}>{cat.name}</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {produtos
                .filter((p) => p.category?.id === cat.id)
                .map((p) => (
                  <div
                    key={p.id}
                    onClick={() => addItem(p)}
                    style={{
                      background: "#fff",
                      border: "1px solid #eee",
                      padding: 20,
                      cursor: "pointer",
                      borderRadius: 10,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                  >
                    <h3>{p.name}</h3>
                    <p>R$ {Number(p.price).toFixed(2)}</p>
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
                <strong>{item.name}</strong>
                <span>R$ {(item.price * item.qtd).toFixed(2)}</span>
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
                      background: "#eee",
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
                      background: "#FF6B00",
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
                    color: "#B00020",
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
          <span>R$ {total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
