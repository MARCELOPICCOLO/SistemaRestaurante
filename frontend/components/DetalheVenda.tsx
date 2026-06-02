// components/DetalhesVenda.tsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faTrash,
  faCheck,
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
  customer_name: string;
  status: string;
  total?: number;
  items?: VendaItem[];
  created_at?: string;
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
  formatCurrency: (value: any) => string;
  isMobile?: boolean;
}

export const DetalhesVenda: React.FC<DetalhesVendaProps> = ({
  venda,
  pontosVenda,
  onRemoverItem,
  onFinalizarVenda,
  formatCurrency,
  isMobile = false,
}) => {
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

  if (!venda.items || venda.items.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "#9ca3af", padding: "40px" }}>
        <FontAwesomeIcon
          icon={faShoppingCart}
          style={{ fontSize: 48, marginBottom: 12 }}
        />
        <p>Nenhum item adicionado</p>
        <p style={{ fontSize: 12 }}>
          Clique nos produtos ao lado para adicionar
        </p>
      </div>
    );
  }

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
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            Venda Atual
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
            Cliente: {venda.customer_name} • #{venda.id}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>
            Ponto: {getNomePontoVenda(venda.table_id)}
          </p>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
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
                      color: "#374151",
                    }}
                  >
                    Produto
                  </th>
                  <th
                    style={{
                      padding: "10px 8px",
                      textAlign: "center",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    Qtd
                  </th>
                  <th
                    style={{
                      padding: "10px 8px",
                      textAlign: "right",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    Preço Unit.
                  </th>
                  <th
                    style={{
                      padding: "10px 8px",
                      textAlign: "right",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    Subtotal
                  </th>
                  <th
                    style={{
                      padding: "10px 8px",
                      textAlign: "center",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {venda.items.map((item, index) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom:
                        index < venda.items.length - 1
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
                    <td style={{ padding: "10px 8px", textAlign: "center" }}>
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
                    {formatCurrency(calcularTotal(venda.items))}
                  </td>
                  <td style={{ padding: "12px 8px" }} />
                </tr>
              </tfoot>
            </table>
          </div>

          {venda.status === "aberto" && (
            <div style={{ marginTop: 16 }}>
              <button
                onClick={onFinalizarVenda}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#10b981",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 14,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#059669";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#10b981";
                }}
              >
                <FontAwesomeIcon icon={faCheck} style={{ marginRight: 8 }} />{" "}
                Finalizar Venda
              </button>
            </div>
          )}
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
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
          Itens da Venda
        </h3>
        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6b7280" }}>
          {venda.customer_name} • #{venda.id}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 10, color: "#9ca3af" }}>
          Ponto: {getNomePontoVenda(venda.table_id)}
        </p>
      </div>
      <div style={{ padding: "12px" }}>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "8px 6px", textAlign: "left" }}>
                  Produto
                </th>
                <th style={{ padding: "8px 6px", textAlign: "center" }}>Qtd</th>
                <th style={{ padding: "8px 6px", textAlign: "right" }}>
                  Subtotal
                </th>
                <th style={{ padding: "8px 6px", textAlign: "center" }}>
                  Ação
                </th>
              </tr>
            </thead>
            <tbody>
              {venda.items.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
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
                  {formatCurrency(calcularTotal(venda.items))}
                </td>
                <td style={{ padding: "8px 6px" }} />
              </tr>
            </tfoot>
          </table>
        </div>
        {venda.status === "aberto" && (
          <button
            onClick={onFinalizarVenda}
            style={{
              width: "100%",
              marginTop: 12,
              padding: "10px",
              background: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Finalizar Venda
          </button>
        )}
      </div>
    </div>
  );
};
