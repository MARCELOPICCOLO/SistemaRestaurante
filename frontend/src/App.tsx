import { useState } from "react";
import PDV from "./pages/PDV";
import Produtos from "./pages/Produtos";
import Caixa from "./pages/Caixa";
import Relatorio from "./pages/Relatorio";

export default function App() {
  const [tela, setTela] = useState("pdv");

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* 🔝 NAVBAR PADRONIZADA - VERSÃO CLEAN */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
          background: "#1f2937",
          borderBottom: "1px solid #374151",
        }}
      >
        {/* Logo / Nome */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "#10b981",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            🍟
          </div>
          <h2
            style={{ color: "#fff", margin: 0, fontSize: 18, fontWeight: 600 }}
          >
            Gyn Batatas
          </h2>
        </div>

        {/* Menu - SEM ÍCONES */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setTela("pdv")}
            style={{
              background: tela === "pdv" ? "#10b981" : "transparent",
              color: tela === "pdv" ? "#fff" : "#9ca3af",
              border: tela === "pdv" ? "none" : "1px solid #374151",
              padding: "6px 20px",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 14,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (tela !== "pdv") {
                e.currentTarget.style.background = "#374151";
                e.currentTarget.style.color = "#fff";
              }
            }}
            onMouseLeave={(e) => {
              if (tela !== "pdv") {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#9ca3af";
              }
            }}
          >
            PDV
          </button>

          <button
            onClick={() => setTela("produtos")}
            style={{
              background: tela === "produtos" ? "#10b981" : "transparent",
              color: tela === "produtos" ? "#fff" : "#9ca3af",
              border: tela === "produtos" ? "none" : "1px solid #374151",
              padding: "6px 20px",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 14,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (tela !== "produtos") {
                e.currentTarget.style.background = "#374151";
                e.currentTarget.style.color = "#fff";
              }
            }}
            onMouseLeave={(e) => {
              if (tela !== "produtos") {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#9ca3af";
              }
            }}
          >
            Estoque
          </button>

          <button
            onClick={() => setTela("caixa")}
            style={{
              background: tela === "caixa" ? "#10b981" : "transparent",
              color: tela === "caixa" ? "#fff" : "#9ca3af",
              border: tela === "caixa" ? "none" : "1px solid #374151",
              padding: "6px 20px",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 14,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (tela !== "caixa") {
                e.currentTarget.style.background = "#374151";
                e.currentTarget.style.color = "#fff";
              }
            }}
            onMouseLeave={(e) => {
              if (tela !== "caixa") {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#9ca3af";
              }
            }}
          >
            Caixa
          </button>

          <button
            onClick={() => setTela("relatorio")}
            style={{
              background: tela === "relatorio" ? "#10b981" : "transparent",
              color: tela === "relatorio" ? "#fff" : "#9ca3af",
              border: tela === "relatorio" ? "none" : "1px solid #374151",
              padding: "6px 20px",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 14,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (tela !== "relatorio") {
                e.currentTarget.style.background = "#374151";
                e.currentTarget.style.color = "#fff";
              }
            }}
            onMouseLeave={(e) => {
              if (tela !== "relatorio") {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#9ca3af";
              }
            }}
          >
            Relatório
          </button>
        </div>

        {/* Info adicional - opcional */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 4px #10b981",
            }}
          />
          <span style={{ fontSize: 12, color: "#9ca3af" }}>Online</span>
        </div>
      </div>

      {/* 🔻 CONTEÚDO */}
      <div style={{ flex: 1, background: "#FAFAFA" }}>
        {tela === "pdv" && <PDV />}
        {tela === "produtos" && <Produtos />}
        {tela === "caixa" && <Caixa />}
        {tela === "relatorio" && <Relatorio />}
      </div>
    </div>
  );
}
