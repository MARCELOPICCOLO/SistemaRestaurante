import React, { useState } from "react";

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

interface TabelaProdutosPdvProps {
  produtos: Produto[];
  categorias: Categoria[];
  onProductSelect: (produto: Produto) => void;
  disabled?: boolean;
  isMobile?: boolean;
}

const TabelaProdutosPdv: React.FC<TabelaProdutosPdvProps> = ({
  produtos,
  categorias,
  onProductSelect,
  disabled = false,
  isMobile = false,
}) => {
  const [filtroProduto, setFiltroProduto] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("todas");

  // Filtrar produtos por nome/código
  const produtosFiltrados = produtos.filter((produto) => {
    const searchTerm = filtroProduto.toLowerCase();
    const matchesName = produto.name.toLowerCase().includes(searchTerm);
    const matchesCode =
      produto.product_code &&
      produto.product_code.toLowerCase().includes(searchTerm);
    return matchesName || matchesCode;
  });

  // Obter categorias únicas
  const categoriasUnicas = [
    "todas",
    ...new Set(categorias.map((cat) => cat.name)),
  ];

  // Filtrar por categoria
  const produtosFiltradosPorCategoria = produtosFiltrados.filter((produto) => {
    if (categoriaSelecionada === "todas") return true;
    const categoriaProduto = categorias.find(
      (cat) => cat.id === produto.category?.id,
    );
    return categoriaProduto?.name === categoriaSelecionada;
  });

  // Versão Desktop (Tabela)
  if (!isMobile) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Filtros */}
        <div style={{ marginBottom: 16, flexShrink: 0 }}>
          {/* Busca */}
          <input
            type="text"
            placeholder="Buscar por nome ou código..."
            value={filtroProduto}
            onChange={(e) => setFiltroProduto(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: 14,
              outline: "none",
              marginBottom: 12,
              backgroundColor: "#fff",
            }}
          />

          {/* Filtro de categoria */}
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {categoriasUnicas.map((categoria) => (
              <button
                key={categoria}
                onClick={() => setCategoriaSelecionada(categoria)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 20,
                  border:
                    categoriaSelecionada === categoria
                      ? "1px solid #10b981"
                      : "1px solid #e5e7eb",
                  backgroundColor:
                    categoriaSelecionada === categoria ? "#f0fdf4" : "#fff",
                  color:
                    categoriaSelecionada === categoria ? "#059669" : "#6b7280",
                  fontSize: 13,
                  fontWeight: categoriaSelecionada === categoria ? 600 : 400,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
              >
                {categoria === "todas" ? "Todos" : categoria}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela de Produtos */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            backgroundColor: "#fff",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14,
            }}
          >
            <thead
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
                zIndex: 1,
              }}
            >
              <tr>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "#374151",
                    borderRight: "1px solid #e5e7eb",
                    width: "20%",
                  }}
                >
                  Código
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "#374151",
                    borderRight: "1px solid #e5e7eb",
                    width: "35%",
                  }}
                >
                  Produto
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    fontWeight: 600,
                    color: "#374151",
                    borderRight: "1px solid #e5e7eb",
                    width: "20%",
                  }}
                >
                  Preço
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    fontWeight: 600,
                    color: "#374151",
                    width: "25%",
                  }}
                >
                  Ação
                </th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltradosPorCategoria.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#9ca3af",
                      }}
                    >
                      Nenhum produto encontrado
                    </div>
                  </td>
                </tr>
              ) : (
                produtosFiltradosPorCategoria.map((produto, index) => (
                  <tr
                    key={produto.id}
                    style={{
                      borderBottom:
                        index < produtosFiltradosPorCategoria.length - 1
                          ? "1px solid #e5e7eb"
                          : "none",
                      backgroundColor: index % 2 === 0 ? "#fff" : "#fafafa",
                      opacity: disabled ? 0.5 : 1,
                    }}
                  >
                    <td
                      style={{
                        padding: "12px",
                        borderRight: "1px solid #e5e7eb",
                        fontFamily: "monospace",
                        fontSize: 12,
                        color: "#6b7280",
                      }}
                    >
                      {produto.product_code || "-"}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        borderRight: "1px solid #e5e7eb",
                      }}
                    >
                      <div style={{ fontWeight: 500 }}>{produto.name}</div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#9ca3af",
                          marginTop: 2,
                        }}
                      >
                        {
                          categorias.find(
                            (cat) => cat.id === produto.category?.id,
                          )?.name
                        }
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        borderRight: "1px solid #e5e7eb",
                        fontWeight: 600,
                        color: "#059669",
                      }}
                    >
                      R$ {Number(produto.price).toFixed(2)}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <button
                        onClick={() => onProductSelect(produto)}
                        disabled={disabled}
                        style={{
                          padding: "6px 16px",
                          borderRadius: 6,
                          border: "none",
                          backgroundColor: disabled ? "#9ca3af" : "#10b981",
                          color: "#fff",
                          fontWeight: 500,
                          cursor: disabled ? "not-allowed" : "pointer",
                          fontSize: 13,
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          if (!disabled) {
                            e.currentTarget.style.backgroundColor = "#059669";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!disabled) {
                            e.currentTarget.style.backgroundColor = "#10b981";
                          }
                        }}
                      >
                        Adicionar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Estatísticas */}
        <div
          style={{
            marginTop: 12,
            padding: "8px 12px",
            backgroundColor: "#f9fafb",
            borderRadius: 6,
            fontSize: 12,
            color: "#6b7280",
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          Total: {produtosFiltradosPorCategoria.length} produtos
          {categoriaSelecionada !== "todas" && ` em ${categoriaSelecionada}`}
        </div>
      </div>
    );
  }

  // Versão Mobile (Cards)
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Filtros */}
      <div style={{ marginBottom: 16, flexShrink: 0 }}>
        <input
          type="text"
          placeholder="Buscar por nome ou código..."
          value={filtroProduto}
          onChange={(e) => setFiltroProduto(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            fontSize: 14,
            outline: "none",
            marginBottom: 12,
            backgroundColor: "#fff",
          }}
        />

        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          {categoriasUnicas.map((categoria) => (
            <button
              key={categoria}
              onClick={() => setCategoriaSelecionada(categoria)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border:
                  categoriaSelecionada === categoria
                    ? "1px solid #10b981"
                    : "1px solid #e5e7eb",
                backgroundColor:
                  categoriaSelecionada === categoria ? "#f0fdf4" : "#fff",
                color:
                  categoriaSelecionada === categoria ? "#059669" : "#6b7280",
                fontSize: 13,
                fontWeight: categoriaSelecionada === categoria ? 600 : 400,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {categoria === "todas" ? "Todos" : categoria}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Produtos Mobile */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {produtosFiltradosPorCategoria.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#9ca3af",
            }}
          >
            Nenhum produto encontrado
          </div>
        ) : (
          produtosFiltradosPorCategoria.map((produto) => (
            <div
              key={produto.id}
              style={{
                backgroundColor: "#fff",
                borderRadius: 8,
                padding: 12,
                marginBottom: 8,
                border: "1px solid #e5e7eb",
                opacity: disabled ? 0.5 : 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>
                    {produto.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                    {
                      categorias.find((cat) => cat.id === produto.category?.id)
                        ?.name
                    }
                  </div>
                  {produto.product_code && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "#6b7280",
                        marginTop: 2,
                        fontFamily: "monospace",
                      }}
                    >
                      Cód: {produto.product_code}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#059669",
                  }}
                >
                  R$ {Number(produto.price).toFixed(2)}
                </div>
              </div>
              <button
                onClick={() => onProductSelect(produto)}
                disabled={disabled}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: disabled ? "#9ca3af" : "#10b981",
                  color: "#fff",
                  fontWeight: 500,
                  cursor: disabled ? "not-allowed" : "pointer",
                  fontSize: 14,
                  marginTop: 8,
                }}
              >
                Adicionar à comanda
              </button>
            </div>
          ))
        )}
      </div>

      {/* Estatísticas */}
      <div
        style={{
          marginTop: 12,
          padding: "10px",
          backgroundColor: "#f9fafb",
          borderRadius: 6,
          fontSize: 12,
          color: "#6b7280",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        Total: {produtosFiltradosPorCategoria.length} produtos
      </div>
    </div>
  );
};

export default TabelaProdutosPdv;
