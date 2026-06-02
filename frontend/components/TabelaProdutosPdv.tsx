// components/TabelaProdutosPdv.tsx

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";

import ModalConfigProduto from "./ModalConfigProduto";

interface Produto {
  id: number;
  name: string;
  price: number;
  product_code?: string;
  category?: {
    id: number;
    name: string;
  };
}

interface Categoria {
  id: number;
  name: string;
}

interface Venda {
  id: number;
  customer_name: string;
  status: string;
  total?: number;
  table_id?: number;
}

interface PontoVenda {
  id: number;
  number: number;
}

interface TabelaProdutosPdvProps {
  produtos: Produto[];
  categorias: Categoria[];
  pontosVenda?: PontoVenda[];

  onProductSelect: (
    produto: Produto,
    vendaId: number,
    precoPersonalizado: number,
  ) => void;

  vendasAbertas?: Venda[];

  disabled?: boolean;

  isMobile?: boolean;
}

const TabelaProdutosPdv: React.FC<TabelaProdutosPdvProps> = ({
  produtos,
  categorias,
  pontosVenda = [],
  onProductSelect,
  vendasAbertas = [],
  disabled = false,
  isMobile = false,
}) => {
  const [filtroProduto, setFiltroProduto] = useState("");

  const [categoriaSelecionada, setCategoriaSelecionada] = useState("todas");

  const [modalVisible, setModalVisible] = useState(false);

  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(
    null,
  );

  const [precoPersonalizado, setPrecoPersonalizado] = useState("");

  const [usarPrecoPersonalizado, setUsarPrecoPersonalizado] = useState(false);

  const [vendaSelecionadaId, setVendaSelecionadaId] = useState<number | null>(
    null,
  );

  // =========================
  // FILTROS
  // =========================

  const produtosFiltrados = produtos.filter((produto) => {
    const searchTerm = filtroProduto.toLowerCase();

    const matchesName = produto.name.toLowerCase().includes(searchTerm);

    const matchesCode =
      produto.product_code &&
      produto.product_code.toLowerCase().includes(searchTerm);

    return matchesName || matchesCode;
  });

  const categoriasUnicas = [
    "todas",
    ...new Set(categorias.map((cat) => cat.name)),
  ];

  const produtosFiltradosPorCategoria = produtosFiltrados.filter((produto) => {
    if (categoriaSelecionada === "todas") return true;

    const categoriaProduto = categorias.find(
      (cat) => cat.id === produto.category?.id,
    );

    return categoriaProduto?.name === categoriaSelecionada;
  });

  // =========================
  // AUXILIARES
  // =========================

  const getNomePontoVenda = (tableId?: number): string => {
    if (!tableId) return "-";

    const ponto = pontosVenda.find((p) => p.id === tableId);

    if (!ponto) return "-";

    return ponto.number === 0
      ? "Balcão"
      : `Ponto ${ponto.number.toString().padStart(2, "0")}`;
  };

  const formatCurrency = (value: number): string => {
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  };

  // =========================
  // AÇÕES
  // =========================

  const handleAddClick = (produto: Produto) => {
    if (vendasAbertas.length === 0) {
      alert("Não há vendas abertas. Abra uma nova venda primeiro.");

      return;
    }

    setProdutoSelecionado(produto);

    setPrecoPersonalizado("");

    setUsarPrecoPersonalizado(false);

    setVendaSelecionadaId(null);

    setModalVisible(true);
  };

  const handleConfirmAdd = () => {
    if (!produtoSelecionado) return;

    let precoFinal = produtoSelecionado.price;

    if (usarPrecoPersonalizado) {
      const valorNumerico = parseFloat(precoPersonalizado.replace(",", "."));

      if (!isNaN(valorNumerico) && valorNumerico > 0) {
        precoFinal = valorNumerico;
      } else {
        alert("Informe um preço válido");
        return;
      }
    }

    if (vendasAbertas.length === 1 && !vendaSelecionadaId) {
      onProductSelect(produtoSelecionado, vendasAbertas[0].id, precoFinal);

      closeModal();
    } else if (vendaSelecionadaId) {
      onProductSelect(produtoSelecionado, vendaSelecionadaId, precoFinal);

      closeModal();
    } else {
      alert("Selecione uma venda");
    }
  };

  const closeModal = () => {
    setModalVisible(false);

    setProdutoSelecionado(null);

    setPrecoPersonalizado("");

    setVendaSelecionadaId(null);

    setUsarPrecoPersonalizado(false);
  };

  // =========================
  // DESKTOP
  // =========================

  if (!isMobile) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* FILTROS */}
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Buscar..."
            value={filtroProduto}
            onChange={(e) => setFiltroProduto(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
              marginBottom: 12,
            }}
          />

          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
            }}
          >
            {categoriasUnicas.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSelecionada(cat)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 20,
                  border:
                    categoriaSelecionada === cat
                      ? "1px solid #10b981"
                      : "1px solid #ccc",

                  background: categoriaSelecionada === cat ? "#f0fdf4" : "#fff",

                  color: categoriaSelecionada === cat ? "#059669" : "#666",

                  cursor: "pointer",
                }}
              >
                {cat === "todas" ? "Todos" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* TABELA */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            border: "1px solid #ccc",
            borderRadius: 8,
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead
              style={{
                background: "#f9fafb",
                borderBottom: "1px solid #ccc",
              }}
            >
              <tr>
                <th
                  style={{
                    padding: 12,
                    textAlign: "left",
                  }}
                >
                  Código
                </th>

                <th
                  style={{
                    padding: 12,
                    textAlign: "left",
                  }}
                >
                  Produto
                </th>

                <th
                  style={{
                    padding: 12,
                    textAlign: "left",
                  }}
                >
                  Categoria
                </th>

                <th
                  style={{
                    padding: 12,
                    textAlign: "right",
                  }}
                >
                  Preço
                </th>

                <th
                  style={{
                    padding: 12,
                    textAlign: "center",
                  }}
                >
                  Ação
                </th>
              </tr>
            </thead>

            <tbody>
              {produtosFiltradosPorCategoria.map((p, i) => (
                <tr
                  key={p.id}
                  style={{
                    borderBottom:
                      i < produtosFiltradosPorCategoria.length - 1
                        ? "1px solid #ccc"
                        : "none",
                  }}
                >
                  <td
                    style={{
                      padding: 12,
                    }}
                  >
                    {p.product_code || "-"}
                  </td>

                  <td
                    style={{
                      padding: 12,
                    }}
                  >
                    {p.name}
                  </td>

                  <td
                    style={{
                      padding: 12,
                    }}
                  >
                    {categorias.find((c) => c.id === p.category?.id)?.name ||
                      "-"}
                  </td>

                  <td
                    style={{
                      padding: 12,
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(p.price)}
                  </td>

                  <td
                    style={{
                      padding: 12,
                      textAlign: "center",
                    }}
                  >
                    <button
                      onClick={() => handleAddClick(p)}
                      disabled={disabled}
                      style={{
                        padding: "4px 12px",

                        borderRadius: 4,

                        border: "none",

                        background: "#10b981",

                        color: "#fff",

                        cursor: "pointer",
                      }}
                    >
                      <FontAwesomeIcon icon={faShoppingCart} /> Adicionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div
          style={{
            marginTop: 12,
            padding: 8,
            background: "#f9fafb",
            borderRadius: 6,
            textAlign: "center",
            fontSize: 12,
          }}
        >
          Total: {produtosFiltradosPorCategoria.length} produtos
        </div>

        {modalVisible && (
          <ModalConfigProduto
            produtoSelecionado={produtoSelecionado}
            vendasAbertas={vendasAbertas}
            vendaSelecionadaId={vendaSelecionadaId}
            setVendaSelecionadaId={setVendaSelecionadaId}
            precoPersonalizado={precoPersonalizado}
            setPrecoPersonalizado={setPrecoPersonalizado}
            usarPrecoPersonalizado={usarPrecoPersonalizado}
            setUsarPrecoPersonalizado={setUsarPrecoPersonalizado}
            closeModal={closeModal}
            handleConfirmAdd={handleConfirmAdd}
            getNomePontoVenda={getNomePontoVenda}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
    );
  }

  // =========================
  // MOBILE
  // =========================

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* FILTROS */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Buscar..."
          value={filtroProduto}
          onChange={(e) => setFiltroProduto(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: 6,
            border: "1px solid #ccc",
            marginBottom: 12,
          }}
        />

        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
          }}
        >
          {categoriasUnicas.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaSelecionada(cat)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border:
                  categoriaSelecionada === cat
                    ? "1px solid #10b981"
                    : "1px solid #ccc",

                background: categoriaSelecionada === cat ? "#f0fdf4" : "#fff",

                color: categoriaSelecionada === cat ? "#059669" : "#666",

                cursor: "pointer",
              }}
            >
              {cat === "todas" ? "Todos" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* CARDS */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
        }}
      >
        {produtosFiltradosPorCategoria.map((p) => (
          <div
            key={p.id}
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: 12,
              marginBottom: 8,
              border: "1px solid #ccc",
            }}
          >
            <div
              style={{
                fontWeight: 600,
              }}
            >
              {p.name}
            </div>

            <div
              style={{
                fontSize: 12,
                color: "#666",
              }}
            >
              Cód: {p.product_code || "-"}
            </div>

            <div
              style={{
                fontSize: 12,
                color: "#666",
                marginBottom: 8,
              }}
            >
              {categorias.find((c) => c.id === p.category?.id)?.name || "-"}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",

                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  color: "#059669",
                }}
              >
                {formatCurrency(p.price)}
              </span>

              <button
                onClick={() => handleAddClick(p)}
                disabled={disabled}
                style={{
                  padding: "6px 12px",
                  borderRadius: 4,
                  border: "none",
                  background: "#10b981",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <FontAwesomeIcon icon={faShoppingCart} /> Adicionar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div
        style={{
          marginTop: 12,
          padding: 10,
          background: "#f9fafb",
          borderRadius: 6,
          textAlign: "center",
          fontSize: 12,
        }}
      >
        Total: {produtosFiltradosPorCategoria.length} produtos
      </div>

      {modalVisible && (
        <ModalConfigProduto
          produtoSelecionado={produtoSelecionado}
          vendasAbertas={vendasAbertas}
          vendaSelecionadaId={vendaSelecionadaId}
          setVendaSelecionadaId={setVendaSelecionadaId}
          precoPersonalizado={precoPersonalizado}
          setPrecoPersonalizado={setPrecoPersonalizado}
          usarPrecoPersonalizado={usarPrecoPersonalizado}
          setUsarPrecoPersonalizado={setUsarPrecoPersonalizado}
          closeModal={closeModal}
          handleConfirmAdd={handleConfirmAdd}
          getNomePontoVenda={getNomePontoVenda}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};

export default TabelaProdutosPdv;
