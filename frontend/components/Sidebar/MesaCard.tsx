// components/Sidebar/MesaCard.tsx
import React from "react";

interface MesaCardProps {
  mesa: string;
  numeroMesa: string;
  comandasDaMesa: any[];
  isActive: boolean;
  ocupada: boolean;
  isBalcao: boolean;
  temComandaAberta: boolean;
  onClick: () => void;
  onMenuClick: (e: React.MouseEvent, mesa: string) => void;
  orders: any[];
}

export const MesaCard: React.FC<MesaCardProps> = ({
  mesa,
  numeroMesa,
  comandasDaMesa,
  isActive,
  ocupada,
  isBalcao,
  temComandaAberta,
  onClick,
  onMenuClick,
  orders,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        background: isBalcao
          ? temComandaAberta
            ? "#1e3a2f"
            : "#10b981"
          : isActive
            ? "#374151"
            : ocupada
              ? "#1e3a2f"
              : "#111827",
        borderRadius: 6,
        padding: "10px 4px",
        cursor: "pointer",
        transition: "all 0.2s",
        border: isActive ? "1px solid #10b981" : "1px solid #374151",
        textAlign: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 4,
          right: 4,
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: ocupada ? "#10b981" : "#6b7280",
        }}
      />
      <div
        style={{
          fontSize: 16,
          fontWeight: "bold",
          color: "#fff",
          fontFamily: "monospace",
        }}
      >
        {isBalcao ? "🏃" : numeroMesa.padStart(2, "0")}
      </div>
      {isBalcao && (
        <div
          style={{
            fontSize: 9,
            color: "#fff",
            marginTop: 2,
            opacity: 0.9,
          }}
        >
          {temComandaAberta ? "Atendendo" : "Clique para iniciar"}
        </div>
      )}
      {!isBalcao && ocupada && (
        <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 2 }}>
          {comandasDaMesa.length} comanda(s)
        </div>
      )}
      {!isBalcao && (
        <div
          style={{
            position: "absolute",
            bottom: 2,
            right: 4,
            background: "rgba(0,0,0,0.6)",
            borderRadius: 3,
            width: 16,
            height: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onClick={(e) => onMenuClick(e, mesa)}
        >
          <span style={{ color: "#fff", fontSize: 10, lineHeight: 1 }}>⋮</span>
        </div>
      )}
    </div>
  );
};
