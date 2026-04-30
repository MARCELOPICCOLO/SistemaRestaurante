import { useState } from "react";

export default function Produtos() {
  const [produtos, setProdutos] = useState([
    { id: 1, nome: "Batata P", estoque: 20, categoria: "Porções", preco: 15 },
    { id: 2, nome: "Batata M", estoque: 15, categoria: "Porções", preco: 23 },
    {
      id: 3,
      nome: "Chopp 300ml",
      estoque: 50,
      categoria: "Bebidas",
      preco: 10,
    },
  ]);

  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    estoque: 0,
    categoria: "",
    preco: 0,
  });

  const adicionarProduto = () => {
    if (!novoProduto.nome) return;

    setProdutos([...produtos, { ...novoProduto, id: Date.now() }]);

    setNovoProduto({ nome: "", estoque: 0, categoria: "", preco: 0 });
  };

  const alterarEstoque = (id, delta) => {
    setProdutos(
      produtos.map((p) =>
        p.id === id ? { ...p, estoque: Math.max(0, p.estoque + delta) } : p,
      ),
    );
  };

  const removerProduto = (id) => {
    setProdutos(produtos.filter((p) => p.id !== id));
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 3fr",
        height: "100vh",
      }}
    >
      {/* Sidebar */}
      <div style={{ background: "#111", color: "#fff", padding: 20 }}>
        <h1>Estoque</h1>
        <p>Gerenciamento de produtos</p>

        <div style={{ marginTop: 20 }}>
          <input
            placeholder="Nome"
            value={novoProduto.nome}
            onChange={(e) =>
              setNovoProduto({ ...novoProduto, nome: e.target.value })
            }
          />

          <input
            placeholder="Categoria"
            value={novoProduto.categoria}
            onChange={(e) =>
              setNovoProduto({ ...novoProduto, categoria: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Estoque"
            value={novoProduto.estoque}
            onChange={(e) =>
              setNovoProduto({
                ...novoProduto,
                estoque: Number(e.target.value),
              })
            }
          />

          <input
            type="number"
            placeholder="Preço"
            value={novoProduto.preco}
            onChange={(e) =>
              setNovoProduto({ ...novoProduto, preco: Number(e.target.value) })
            }
          />

          <button onClick={adicionarProduto}>+ Produto</button>
        </div>
      </div>

      {/* Lista de produtos */}
      <div style={{ padding: 20, overflowY: "auto" }}>
        <h2>Produtos</h2>

        {produtos.map((p) => (
          <div
            key={p.id}
            style={{
              background: "#fff",
              padding: 15,
              borderRadius: 10,
              marginBottom: 10,
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong>{p.nome}</strong>
              <p>{p.categoria}</p>
              <p>R$ {p.preco}</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => alterarEstoque(p.id, -1)}>-</button>
              <span>{p.estoque}</span>
              <button onClick={() => alterarEstoque(p.id, 1)}>+</button>

              <button
                onClick={() => removerProduto(p.id)}
                style={{
                  color: "red",
                  border: "none",
                  background: "none",
                  fontSize: 18,
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
