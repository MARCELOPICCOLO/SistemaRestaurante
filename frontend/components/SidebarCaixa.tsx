import React from "react";

interface SidebarCaixaProps {
  setShowModalSaida: (show: boolean) => void;
  setShowModalGerenciar: (show: boolean) => void;
  setShowModalImportarGastos: (show: boolean) => void;
  setShowModalImportarVendas: (show: boolean) => void;
}

export const SidebarCaixa: React.FC<SidebarCaixaProps> = ({
  setShowModalSaida,
  setShowModalGerenciar,
  setShowModalImportarGastos,
  setShowModalImportarVendas,
}) => {
  return (
    <div
      style={{
        background: "#1f2937",
        color: "#fff",
        height: "100vh",
        overflowY: "auto",
      }}
    >
      <div style={{ padding: "16px", borderBottom: "1px solid #374151" }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
          Ações Rápidas
        </h2>
      </div>

      <div style={{ padding: "16px" }}>
        <button
          onClick={() => setShowModalSaida(true)}
          style={{
            width: "100%",
            padding: "10px",
            background: "#dc2626",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 500,
            fontSize: 13,
            marginBottom: 10,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#b91c1c")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#dc2626")}
        >
          Nova Saída (Gasto)
        </button>

        <button
          onClick={() => setShowModalGerenciar(true)}
          style={{
            width: "100%",
            padding: "10px",
            background: "#374151",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 500,
            fontSize: 13,
            marginBottom: 10,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#4b5563")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#374151")}
        >
          Gerenciar Categorias
        </button>

        <button
          onClick={() => setShowModalImportarGastos(true)}
          style={{
            width: "100%",
            padding: "10px",
            background: "#374151",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 500,
            fontSize: 13,
            marginBottom: 10,
            marginTop: 10,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#4b5563")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#374151")}
        >
          📤 Importar Gastos
        </button>

        <button
          onClick={() => setShowModalImportarVendas(true)}
          style={{
            width: "100%",
            padding: "10px",
            background: "#374151",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 500,
            fontSize: 13,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#4b5563")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#374151")}
        >
          📤 Importar Vendas
        </button>
      </div>
    </div>
  );
};
