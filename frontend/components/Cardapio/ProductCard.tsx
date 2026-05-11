// components/Cardapio/ProductCard.tsx
import React from "react";

interface ProductCardProps {
  produto: any;
  comandaAberta: boolean;
  onAddItem: (produto: any) => void;
  isMobile: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  produto,
  comandaAberta,
  onAddItem,
  isMobile,
}) => {
  return (
    <div
      onClick={() => comandaAberta && onAddItem(produto)}
      style={{
        cursor: comandaAberta ? "pointer" : "not-allowed",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: isMobile ? "12px" : "8px 12px",
        background: "#fff",
        borderRadius: 6,
        border: "1px solid #e5e7eb",
        opacity: comandaAberta ? 1 : 0.5,
        transition: "all 0.2s",
        gap: 8,
      }}
      onMouseEnter={(e) => {
        if (comandaAberta) {
          e.currentTarget.style.background = "#f9fafb";
          e.currentTarget.style.borderColor = "#10b981";
          if (!isMobile) e.currentTarget.style.transform = "translateX(4px)";
        }
      }}
      onMouseLeave={(e) => {
        if (comandaAberta) {
          e.currentTarget.style.background = "#fff";
          e.currentTarget.style.borderColor = "#e5e7eb";
          if (!isMobile) e.currentTarget.style.transform = "translateX(0)";
        }
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: isMobile ? 14 : 13, fontWeight: 500 }}>
          {produto.name}
        </div>
        {produto.product_code && (
          <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>
            {produto.product_code}
          </div>
        )}
      </div>
      <span
        style={{
          color: "#059669",
          fontWeight: "bold",
          fontSize: isMobile ? 14 : 13,
        }}
      >
        R$ {Number(produto.price).toFixed(2)}
      </span>
    </div>
  );
};
