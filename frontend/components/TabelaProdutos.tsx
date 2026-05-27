import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faMinus,
  faPlus,
  faSave,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

interface Product {
  id: number;
  name: string;
  product_code: string;
  price: number;
  quantity: number;
  category_id: number;
  category?: {
    id: number;
    name: string;
  };
  active: boolean;
}

interface TabelaProdutosProps {
  produtos: Product[];
  loading: boolean;
  formatCurrency: (value: any) => string;
  abrirModalEditar: (produto: Product) => void;
  removerProduto: (id: number, name: string) => void;
  salvarAlteracoesEstoque: (
    alteracoes: { id: number; quantity: number }[],
  ) => void;
}

export const TabelaProdutos: React.FC<TabelaProdutosProps> = ({
  produtos,
  loading,
  formatCurrency,
  abrirModalEditar,
  removerProduto,
  salvarAlteracoesEstoque,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [alteracoesPendentes, setAlteracoesPendentes] = useState<
    { id: number; quantity: number }[]
  >([]);
  const [modoEdicao, setModoEdicao] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>Carregando...</div>
    );
  }

  if (produtos.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          background: "#fff",
          borderRadius: 8,
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
        <p>Nenhum produto encontrado</p>
      </div>
    );
  }

  const getQuantidadeAtual = (
    produtoId: number,
    quantidadeOriginal: number,
  ) => {
    const alteracao = alteracoesPendentes.find((a) => a.id === produtoId);
    return alteracao ? alteracao.quantity : quantidadeOriginal;
  };

  const alterarQuantidade = (
    produtoId: number,
    quantidadeOriginal: number,
    delta: number,
  ) => {
    const quantidadeAtual = getQuantidadeAtual(produtoId, quantidadeOriginal);
    const novaQuantidade = Math.max(0, quantidadeAtual + delta);

    setAlteracoesPendentes((prev) => {
      const existing = prev.find((a) => a.id === produtoId);
      if (existing) {
        if (novaQuantidade === quantidadeOriginal) {
          return prev.filter((a) => a.id !== produtoId);
        }
        return prev.map((a) =>
          a.id === produtoId ? { ...a, quantity: novaQuantidade } : a,
        );
      } else {
        if (novaQuantidade !== quantidadeOriginal) {
          return [...prev, { id: produtoId, quantity: novaQuantidade }];
        }
        return prev;
      }
    });

    setModoEdicao(true);
  };

  const cancelarAlteracoes = () => {
    setAlteracoesPendentes([]);
    setModoEdicao(false);
  };

  const salvarAlteracoes = () => {
    if (alteracoesPendentes.length > 0) {
      salvarAlteracoesEstoque(alteracoesPendentes);
      setAlteracoesPendentes([]);
      setModoEdicao(false);
    }
  };

  const BannerPendentes = () => (
    <div
      style={{
        background: "#fef3c7",
        padding: isMobile ? "12px" : "12px 16px",
        borderRadius: 8,
        marginBottom: 16,
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: isMobile ? "stretch" : "center",
        gap: 12,
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "#92400e",
          textAlign: isMobile ? "center" : "left",
        }}
      >
        <FontAwesomeIcon icon={faSave} style={{ marginRight: 6 }} />
        Você tem {alteracoesPendentes.length} alteração(ões) pendente(s) no
        estoque
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button
          onClick={cancelarAlteracoes}
          style={{
            padding: "6px 16px",
            background: "#fff",
            color: "#374151",
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <FontAwesomeIcon icon={faTimes} /> Cancelar
        </button>
        <button
          onClick={salvarAlteracoes}
          style={{
            padding: "6px 16px",
            background: "#10b981",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <FontAwesomeIcon icon={faSave} /> Salvar ({alteracoesPendentes.length}
          )
        </button>
      </div>
    </div>
  );

  // Versão Desktop
  if (!isMobile) {
    return (
      <div>
        {modoEdicao && <BannerPendentes />}

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              background: "#fff",
              borderRadius: 8,
              borderCollapse: "collapse",
              overflow: "hidden",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
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
                  }}
                >
                  Código
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Produto
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: 13,
                    fontWeight: 600,
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
                  }}
                >
                  Preço
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Estoque
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => {
                const quantidadeAtual = getQuantidadeAtual(p.id, p.quantity);
                const temAlteracao = alteracoesPendentes.some(
                  (a) => a.id === p.id,
                );
                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: "1px solid #f0f0f0",
                      background: temAlteracao ? "#fef3c7" : "transparent",
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        color: "#6b7280",
                      }}
                    >
                      {p.product_code || "-"}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#333",
                      }}
                    >
                      {p.name}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        color: "#6b7280",
                      }}
                    >
                      {p.category?.name || "-"}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#059669",
                      }}
                    >
                      {formatCurrency(p.price)}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                        }}
                      >
                        <button
                          onClick={() =>
                            alterarQuantidade(p.id, p.quantity, -1)
                          }
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            border: "none",
                            background: "#fee2e2",
                            color: "#dc2626",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: 14,
                            minWidth: 40,
                            textAlign: "center",
                            color: temAlteracao ? "#f59e0b" : "#333",
                          }}
                        >
                          {quantidadeAtual}
                        </span>
                        <button
                          onClick={() => alterarQuantidade(p.id, p.quantity, 1)}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            border: "none",
                            background: "#d1fae5",
                            color: "#059669",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </div>
                      {temAlteracao && (
                        <div
                          style={{
                            fontSize: 10,
                            color: "#f59e0b",
                            marginTop: 4,
                          }}
                        >
                          *pendente
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          justifyContent: "center",
                        }}
                      >
                        <button
                          onClick={() => abrirModalEditar(p)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#6b7280",
                            fontSize: 16,
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#10b981";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#6b7280";
                          }}
                          title="Editar"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => removerProduto(p.id, p.name)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#6b7280",
                            fontSize: 16,
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#dc2626";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#6b7280";
                          }}
                          title="Excluir"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Versão Mobile
  return (
    <div>
      {modoEdicao && <BannerPendentes />}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {produtos.map((p) => {
          const quantidadeAtual = getQuantidadeAtual(p.id, p.quantity);
          const temAlteracao = alteracoesPendentes.some((a) => a.id === p.id);

          return (
            <div
              key={p.id}
              style={{
                background: temAlteracao ? "#fef3c7" : "#fff",
                borderRadius: 12,
                padding: 12,
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>
                    Cód: {p.product_code || "-"}
                  </div>
                </div>
                <div
                  style={{ fontWeight: 700, fontSize: 14, color: "#059669" }}
                >
                  {formatCurrency(p.price)}
                </div>
              </div>

              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
                {p.category?.name || "Sem categoria"}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                  paddingTop: 8,
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <span style={{ fontSize: 13, color: "#374151" }}>Estoque:</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={() => alterarQuantidade(p.id, p.quantity, -1)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      border: "none",
                      background: "#fee2e2",
                      color: "#dc2626",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      minWidth: 30,
                      textAlign: "center",
                    }}
                  >
                    {quantidadeAtual}
                  </span>
                  <button
                    onClick={() => alterarQuantidade(p.id, p.quantity, 1)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      border: "none",
                      background: "#d1fae5",
                      color: "#059669",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                  paddingTop: 8,
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <button
                  onClick={() => abrirModalEditar(p)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#6b7280",
                    fontSize: 16,
                  }}
                  title="Editar"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  onClick={() => removerProduto(p.id, p.name)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#dc2626",
                    fontSize: 16,
                  }}
                  title="Excluir"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
