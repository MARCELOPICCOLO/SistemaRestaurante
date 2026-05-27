import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faPlus,
  faTags,
  faWarehouse,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

interface SidebarProdutosProps {
  onNovoProduto: () => void;
  onCategorias: () => void;
  totalProdutos: number;
  onVoltarDashboard?: () => void;
}

export const SidebarProdutos: React.FC<SidebarProdutosProps> = ({
  onNovoProduto,
  onCategorias,
  totalProdutos,
  onVoltarDashboard,
}) => {
  const menuItems = [
    {
      id: "novoProduto",
      icon: faPlus,
      label: "Novo Produto",
      description: "Adicionar ao estoque",
      action: onNovoProduto,
    },
    {
      id: "categorias",
      icon: faTags,
      label: "Categorias",
      description: "Gerenciar categorias",
      action: onCategorias,
    },
  ];

  return (
    <div
      style={{
        background: "#1f2937",
        color: "#fff",
        height: "100vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Botão Voltar ao Dashboard */}
      {onVoltarDashboard && (
        <div
          style={{ padding: "16px 20px", borderBottom: "1px solid #374151" }}
        >
          <button
            onClick={onVoltarDashboard}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "8px 12px",
              background: "transparent",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              color: "#9ca3af",
              fontSize: 13,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#9ca3af";
            }}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Voltar ao Dashboard
          </button>
        </div>
      )}

      {/* CABEÇALHO */}
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
              icon={faBox}
              style={{ fontSize: 20, color: "#10b981" }}
            />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
              Produtos
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>
              Gerenciamento de estoque
            </p>
          </div>
        </div>
      </div>

      {/* MENU - AMBOS OS BOTÕES IGUAIS */}
      <div style={{ padding: "20px", flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={item.action}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                width: "100%",
                padding: "12px 16px",
                background: "transparent",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                transition: "all 0.2s",
                color: "#fff",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#374151";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: "#374151",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  style={{ fontSize: 14, color: "#9ca3af" }}
                />
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                  {item.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RODAPÉ */}
      <div
        style={{
          marginTop: "auto",
          padding: "20px",
          borderTop: "1px solid #374151",
          background: "#111827",
        }}
      >
        <div
          style={{
            background: "#374151",
            borderRadius: 10,
            padding: "12px",
            textAlign: "center",
          }}
        >
          <FontAwesomeIcon
            icon={faWarehouse}
            style={{ fontSize: 20, color: "#10b981", marginBottom: 6 }}
          />
          <div style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.4 }}>
            Total em estoque
            <br />
            <strong style={{ fontSize: 16, color: "#fff" }}>
              {totalProdutos}
            </strong>{" "}
            produtos
          </div>
        </div>
      </div>
    </div>
  );
};
