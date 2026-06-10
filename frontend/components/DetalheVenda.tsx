// components/DetalhesVenda.tsx
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faTrash,
  faCheck,
  faBan,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

interface VendaItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: {
    name: string;
    product_code?: string;
  };
}

interface Venda {
  id: number;
  order_number?: string;
  customer_name: string;
  status: string;
  total?: number;
  items?: VendaItem[];
  created_at?: string;
  closed_at?: string;
  table_id?: number;
}

interface PontoVenda {
  id: number;
  number: number;
  restaurant_id: number;
}

interface DetalhesVendaProps {
  venda: Venda | null;
  pontosVenda: PontoVenda[];
  onRemoverItem: (vendaId: number, itemId: number) => void;
  onFinalizarVenda: () => void;
  onCancelarVenda: (vendaId: number) => Promise<void>;
  onMarcarNaoPaga: (vendaId: number) => Promise<void>;
  formatCurrency: (value: any) => string;
  isMobile?: boolean;
}

export const DetalhesVenda: React.FC<DetalhesVendaProps> = ({
  venda,
  pontosVenda,
  onRemoverItem,
  onFinalizarVenda,
  onCancelarVenda,
  onMarcarNaoPaga,
  formatCurrency,
  isMobile = false,
}) => {
  const [loading, setLoading] = useState(false);

  const calcularTotal = (items?: VendaItem[]) => {
    if (!items) return 0;
    return items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );
  };

  const getNomePontoVenda = (tableId?: number) => {
    if (!tableId) return "-";
    const ponto = pontosVenda.find((p) => p.id === tableId);
    if (!ponto) return "-";
    return ponto.number === 0
      ? "Balcão"
      : `Ponto ${ponto.number.toString().padStart(2, "0")}`;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "aberto":
        return { text: "Em andamento", color: "#f59e0b", bg: "#fef3c7" };
      case "fechado":
        return { text: "Finalizada", color: "#10b981", bg: "#d1fae5" };
      case "pendente":
        return { text: "Não Paga", color: "#dc2626", bg: "#fee2e2" };
      case "cancelado":
        return { text: "Cancelada", color: "#6b7280", bg: "#f3f4f6" };
      default:
        return { text: status, color: "#6b7280", bg: "#f3f4f6" };
    }
  };

  const handleCancelarVenda = async () => {
    if (!venda) return;
    const mensagem =
      venda.items && venda.items.length > 0
        ? `Cancelar a venda #${venda.order_number || venda.id}? Todos os itens serão removidos.`
        : `Cancelar a venda #${venda.order_number || venda.id}?`;

    if (confirm(mensagem)) {
      setLoading(true);
      await onCancelarVenda(venda.id);
      setLoading(false);
    }
  };

  const handleMarcarNaoPaga = async () => {
    if (!venda) return;
    if (
      confirm(`Marcar venda #${venda.order_number || venda.id} como não paga?`)
    ) {
      setLoading(true);
      await onMarcarNaoPaga(venda.id);
      setLoading(false);
    }
  };

  if (!venda) {
    return (
      <div style={{ textAlign: "center", color: "#9ca3af", padding: "40px" }}>
        <FontAwesomeIcon
          icon={faShoppingCart}
          style={{ fontSize: 48, marginBottom: 12 }}
        />
        <p>Selecione uma venda na lista de comandas</p>
      </div>
    );
  }

  const statusInfo = getStatusText(venda.status);
  const totalVenda = calcularTotal(venda.items);
  const temItens = venda.items && venda.items.length > 0;

  // Regras para exibir os botões
  const podeFinalizar = venda.status === "aberto" && temItens;
  const podeCancelar = venda.status === "aberto" || venda.status === "pendente";
  const podeMarcarNaoPaga = venda.status === "fechado";

  // Versão Desktop
  if (!isMobile) {
    return (
      <div
        style={{
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
              Venda #{venda.order_number || venda.id}
            </h2>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                background: statusInfo.bg,
                color: statusInfo.color,
              }}
            >
              {statusInfo.text}
            </span>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
            Cliente: {venda.customer_name}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>
            Ponto: {getNomePontoVenda(venda.table_id)}
          </p>
          {venda.closed_at && (
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>
              Data: {new Date(venda.closed_at).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {!temItens ? (
            <div
              style={{ textAlign: "center", color: "#9ca3af", padding: "40px" }}
            >
              <FontAwesomeIcon
                icon={faShoppingCart}
                style={{ fontSize: 48, marginBottom: 12 }}
              />
              <p>Nenhum item adicionado</p>
              <p style={{ fontSize: 12 }}>
                Clique nos produtos ao lado para adicionar
              </p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}
                >
                  <thead
                    style={{
                      position: "sticky",
                      top: 0,
                      backgroundColor: "#f9fafb",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <tr>
                      <th
                        style={{
                          padding: "10px 8px",
                          textAlign: "left",
                          fontWeight: 600,
                        }}
                      >
                        Produto
                      </th>
                      <th
                        style={{
                          padding: "10px 8px",
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      >
                        Qtd
                      </th>
                      <th
                        style={{
                          padding: "10px 8px",
                          textAlign: "right",
                          fontWeight: 600,
                        }}
                      >
                        Preço Unit.
                      </th>
                      <th
                        style={{
                          padding: "10px 8px",
                          textAlign: "right",
                          fontWeight: 600,
                        }}
                      >
                        Subtotal
                      </th>
                      <th
                        style={{
                          padding: "10px 8px",
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      >
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {venda.items!.map((item, index) => (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom:
                            index < venda.items!.length - 1
                              ? "1px solid #e5e7eb"
                              : "none",
                          backgroundColor: index % 2 === 0 ? "#fff" : "#fafafa",
                        }}
                      >
                        <td style={{ padding: "10px 8px" }}>
                          <div style={{ fontWeight: 500 }}>
                            {item.product?.name || `Produto ${item.product_id}`}
                          </div>
                          {item.product?.product_code && (
                            <div
                              style={{
                                fontSize: 10,
                                color: "#9ca3af",
                                marginTop: 2,
                              }}
                            >
                              Cód: {item.product.product_code}
                            </div>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "10px 8px",
                            textAlign: "center",
                            fontWeight: 500,
                          }}
                        >
                          {item.quantity}
                        </td>
                        <td
                          style={{
                            padding: "10px 8px",
                            textAlign: "right",
                            color: "#6b7280",
                          }}
                        >
                          {formatCurrency(item.price)}
                        </td>
                        <td
                          style={{
                            padding: "10px 8px",
                            textAlign: "right",
                            fontWeight: 600,
                            color: "#059669",
                          }}
                        >
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                        <td
                          style={{ padding: "10px 8px", textAlign: "center" }}
                        >
                          {(venda.status === "aberto" ||
                            venda.status === "pendente") && (
                            <button
                              onClick={() => onRemoverItem(venda.id, item.id)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#dc2626",
                                fontSize: 14,
                              }}
                              title="Remover item"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr
                      style={{
                        borderTop: "2px solid #e5e7eb",
                        background: "#f9fafb",
                      }}
                    >
                      <td
                        colSpan={3}
                        style={{
                          padding: "12px 8px",
                          textAlign: "right",
                          fontWeight: 600,
                        }}
                      >
                        Total:
                      </td>
                      <td
                        style={{
                          padding: "12px 8px",
                          textAlign: "right",
                          fontWeight: "bold",
                          fontSize: 16,
                          color: "#059669",
                        }}
                      >
                        {formatCurrency(totalVenda)}
                      </td>
                      <td style={{ padding: "12px 8px" }} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}

          {/* Botões de Ação - SEMPRE VISÍVEIS para vendas abertas ou pendentes */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              gap: 12,
              flexDirection: "column",
            }}
          >
            {podeFinalizar && (
              <button
                onClick={onFinalizarVenda}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#10b981",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: 14,
                }}
              >
                <FontAwesomeIcon icon={faCheck} style={{ marginRight: 8 }} />
                Finalizar Venda
              </button>
            )}

            {podeMarcarNaoPaga && (
              <button
                onClick={handleMarcarNaoPaga}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: 14,
                }}
              >
                <FontAwesomeIcon icon={faClock} style={{ marginRight: 8 }} />
                Marcar como Não Paga
              </button>
            )}

            {podeCancelar && (
              <button
                onClick={handleCancelarVenda}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#6b7280",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: 14,
                }}
              >
                <FontAwesomeIcon icon={faBan} style={{ marginRight: 8 }} />
                Cancelar Venda
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Versão Mobile
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        marginTop: 16,
        border: "1px solid #e5e7eb",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px",
          borderBottom: "1px solid #e5e7eb",
          background: "#f9fafb",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
            Venda #{venda.order_number || venda.id}
          </h3>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 16,
              fontSize: 10,
              fontWeight: 500,
              background: statusInfo.bg,
              color: statusInfo.color,
            }}
          >
            {statusInfo.text}
          </span>
        </div>
        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6b7280" }}>
          {venda.customer_name}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 10, color: "#9ca3af" }}>
          Ponto: {getNomePontoVenda(venda.table_id)}
        </p>
      </div>

      <div style={{ padding: "12px" }}>
        {!temItens ? (
          <div
            style={{ textAlign: "center", color: "#9ca3af", padding: "20px" }}
          >
            <FontAwesomeIcon
              icon={faShoppingCart}
              style={{ fontSize: 32, marginBottom: 8 }}
            />
            <p style={{ fontSize: 12 }}>Nenhum item adicionado</p>
            <p style={{ fontSize: 11, color: "#9ca3af" }}>
              Clique nos produtos para adicionar
            </p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ padding: "8px 6px", textAlign: "left" }}>
                      Produto
                    </th>
                    <th style={{ padding: "8px 6px", textAlign: "center" }}>
                      Qtd
                    </th>
                    <th style={{ padding: "8px 6px", textAlign: "right" }}>
                      Subtotal
                    </th>
                    <th style={{ padding: "8px 6px", textAlign: "center" }}>
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {venda.items!.map((item) => (
                    <tr
                      key={item.id}
                      style={{ borderBottom: "1px solid #e5e7eb" }}
                    >
                      <td style={{ padding: "8px 6px" }}>
                        <div style={{ fontWeight: 500 }}>
                          {item.product?.name || `Produto ${item.product_id}`}
                        </div>
                        <div style={{ fontSize: 9, color: "#9ca3af" }}>
                          {formatCurrency(item.price)}
                        </div>
                      </td>
                      <td style={{ padding: "8px 6px", textAlign: "center" }}>
                        {item.quantity}
                      </td>
                      <td
                        style={{
                          padding: "8px 6px",
                          textAlign: "right",
                          fontWeight: 600,
                          color: "#059669",
                        }}
                      >
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                      <td style={{ padding: "8px 6px", textAlign: "center" }}>
                        {(venda.status === "aberto" ||
                          venda.status === "pendente") && (
                          <button
                            onClick={() => onRemoverItem(venda.id, item.id)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#dc2626",
                              fontSize: 12,
                            }}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr
                    style={{
                      borderTop: "2px solid #e5e7eb",
                      background: "#f9fafb",
                    }}
                  >
                    <td
                      colSpan={2}
                      style={{
                        padding: "8px 6px",
                        textAlign: "right",
                        fontWeight: 600,
                      }}
                    >
                      Total:
                    </td>
                    <td
                      style={{
                        padding: "8px 6px",
                        textAlign: "right",
                        fontWeight: "bold",
                        color: "#059669",
                      }}
                    >
                      {formatCurrency(totalVenda)}
                    </td>
                    <td style={{ padding: "8px 6px" }} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}

        {/* Botões de Ação Mobile - SEMPRE VISÍVEIS */}
        <div
          style={{
            marginTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {podeFinalizar && (
            <button
              onClick={onFinalizarVenda}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px",
                background: "#10b981",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 12,
              }}
            >
              <FontAwesomeIcon icon={faCheck} style={{ marginRight: 6 }} />
              Finalizar Venda
            </button>
          )}

          {podeMarcarNaoPaga && (
            <button
              onClick={handleMarcarNaoPaga}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px",
                background: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 12,
              }}
            >
              <FontAwesomeIcon icon={faClock} style={{ marginRight: 6 }} />
              Marcar como Não Paga
            </button>
          )}

          {podeCancelar && (
            <button
              onClick={handleCancelarVenda}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px",
                background: "#6b7280",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 12,
              }}
            >
              <FontAwesomeIcon icon={faBan} style={{ marginRight: 6 }} />
              Cancelar Venda
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
