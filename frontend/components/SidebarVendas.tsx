// components/SidebarVendas.tsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPlus,
  faCashRegister,
  faBoxes,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";

interface SidebarVendasProps {
  abaAtiva: "produtos" | "comandas";
  onAbaChange: (aba: "produtos" | "comandas") => void;
  onNovaVenda: () => void;
  onVoltarDashboard: () => void;
}

export const SidebarVendas: React.FC<SidebarVendasProps> = ({
  abaAtiva,
  onAbaChange,
  onNovaVenda,
  onVoltarDashboard,
}) => {
  return (
    <div
      style={{
        background: "#1f2937",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflowY: "auto",
      }}
    >
      {/* Botão Voltar ao Dashboard */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #374151" }}>
        <button
          onClick={onVoltarDashboard}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            padding: "10px 16px",
            background: "transparent",
            border: "1px solid #374151",
            borderRadius: 8,
            cursor: "pointer",
            transition: "all 0.2s",
            color: "#9ca3af",
            fontSize: 13,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#374151";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#9ca3af";
          }}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Voltar ao Dashboard
        </button>
      </div>

      {/* Cabeçalho */}
      <div style={{ padding: "24px 20px", borderBottom: "1px solid #374151" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              background: "#374151",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FontAwesomeIcon
              icon={faCashRegister}
              style={{ fontSize: 20, color: "#10b981" }}
            />
          </div>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 600,
                color: "#fff",
              }}
            >
              Gestão de Vendas
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>
              Gerenciar vendas
            </p>
          </div>
        </div>
      </div>

      {/* Botão Nova Venda */}
      <div style={{ padding: "20px" }}>
        <button
          onClick={onNovaVenda}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            width: "100%",
            padding: "12px 16px",
            background: "#10b981",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            transition: "all 0.2s",
            color: "#fff",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#059669";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#10b981";
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: "rgba(255,255,255,0.2)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FontAwesomeIcon
              icon={faPlus}
              style={{ fontSize: 14, color: "#fff" }}
            />
          </div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Nova Venda</div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.8)",
                marginTop: 2,
              }}
            >
              Iniciar atendimento
            </div>
          </div>
        </button>
      </div>

      {/* Navegação por Abas */}
      <div style={{ padding: "0 20px 20px" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => onAbaChange("produtos")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              border:
                abaAtiva === "produtos"
                  ? "1px solid #10b981"
                  : "1px solid #374151",
              background: abaAtiva === "produtos" ? "#10b981" : "transparent",
              color: abaAtiva === "produtos" ? "#fff" : "#9ca3af",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
            }}
          >
            <FontAwesomeIcon icon={faBoxes} /> Produtos
          </button>
          <button
            onClick={() => onAbaChange("comandas")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              border:
                abaAtiva === "comandas"
                  ? "1px solid #10b981"
                  : "1px solid #374151",
              background: abaAtiva === "comandas" ? "#10b981" : "transparent",
              color: abaAtiva === "comandas" ? "#fff" : "#9ca3af",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
            }}
          >
            <FontAwesomeIcon icon={faClipboardList} /> Comandas
          </button>
        </div>
      </div>
    </div>
  );
};
