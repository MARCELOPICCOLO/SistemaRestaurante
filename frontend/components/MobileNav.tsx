// components/MobileNav.tsx
import React from "react";

interface MobileNavProps {
  activePanel: string;
  setActivePanel: (panel: string) => void;
  comandaSelecionada: number | null;
  comandaSelecionadaItemsLength: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activePanel,
  setActivePanel,
  comandaSelecionada,
  comandaSelecionadaItemsLength,
}) => {
  return (
    <div
      style={{
        display: "flex",
        background: "#1f2937",
        borderBottom: "1px solid #374151",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <button
        onClick={() => setActivePanel("mesas")}
        style={{
          flex: 1,
          padding: "12px",
          background: activePanel === "mesas" ? "#10b981" : "transparent",
          color: activePanel === "mesas" ? "#fff" : "#9ca3af",
          border: "none",
          fontWeight: "bold",
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        Mesas
      </button>
      <button
        onClick={() => setActivePanel("cardapio")}
        style={{
          flex: 1,
          padding: "12px",
          background: activePanel === "cardapio" ? "#10b981" : "transparent",
          color: activePanel === "cardapio" ? "#fff" : "#9ca3af",
          border: "none",
          fontWeight: "bold",
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        Cardápio
      </button>
      <button
        onClick={() => setActivePanel("comanda")}
        style={{
          flex: 1,
          padding: "12px",
          background: activePanel === "comanda" ? "#10b981" : "transparent",
          color: activePanel === "comanda" ? "#fff" : "#9ca3af",
          border: "none",
          fontWeight: "bold",
          cursor: "pointer",
          fontSize: 14,
          position: "relative",
        }}
      >
        Comanda
        {comandaSelecionada && comandaSelecionadaItemsLength > 0 && (
          <span
            style={{
              position: "absolute",
              top: 4,
              right: 20,
              background: "#ef4444",
              color: "#fff",
              borderRadius: "50%",
              width: 18,
              height: 18,
              fontSize: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {comandaSelecionadaItemsLength}
          </span>
        )}
      </button>
    </div>
  );
};
