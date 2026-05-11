// components/Comanda/ComandaItem.tsx
import React from "react";

interface ComandaItemProps {
  item: any;
  orderId: number;
  isMobile: boolean;
  onAlterarQtd: (
    orderId: number,
    productId: number,
    delta: number,
    orderItemId: number,
  ) => void;
}

export const ComandaItem: React.FC<ComandaItemProps> = ({
  item,
  orderId,
  isMobile,
  onAlterarQtd,
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 12px",
        marginBottom: 4,
        background: "#f9fafb",
        borderRadius: 6,
        fontSize: isMobile ? 14 : 13,
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      <div
        style={{ flex: 2, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <span style={{ fontWeight: 500 }}>{item.name}</span>
        {item.product_code && (
          <span style={{ fontSize: 10, color: "#9ca3af" }}>
            Cód: {item.product_code}
          </span>
        )}
        {item.orderItemId && (
          <span style={{ fontSize: 9, color: "#6b7280" }}>
            ID: {item.orderItemId}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#6b7280", fontSize: isMobile ? 12 : 11 }}>
          R$ {item.price.toFixed(2)}
        </span>
        <span
          style={{
            fontWeight: "bold",
            minWidth: 35,
            textAlign: "center",
            fontSize: isMobile ? 14 : 13,
          }}
        >
          {item.qtd}x
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => onAlterarQtd(orderId, item.id, -1, item.orderItemId)}
            style={{
              width: isMobile ? 32 : 22,
              height: isMobile ? 32 : 22,
              borderRadius: 6,
              border: "none",
              background: "#fee2e2",
              color: "#dc2626",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: isMobile ? 16 : 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            -
          </button>
          <button
            onClick={() => onAlterarQtd(orderId, item.id, 1, item.orderItemId)}
            style={{
              width: isMobile ? 32 : 22,
              height: isMobile ? 32 : 22,
              borderRadius: 6,
              border: "none",
              background: "#d1fae5",
              color: "#059669",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: isMobile ? 16 : 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};
