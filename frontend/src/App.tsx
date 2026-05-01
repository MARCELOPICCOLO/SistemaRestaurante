import { useState } from "react";
import PDV from "./pages/PDV";
import Produtos from "./pages/Produtos";
import Caixa from "./pages/Caixa";
import Relatorio from "./pages/Relatorio";

export default function App() {
  const [tela, setTela] = useState("pdv");

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* 🔝 NAVBAR PROFISSIONAL */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 20px",
          background: "#FF6B00",
          boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
        }}
      >
        {/* Logo / Nome */}
        <h2 style={{ color: "#fff", margin: 0 }}>🍟 Gyn Batatas</h2>

        {/* Menu */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setTela("pdv")}
            style={{
              background: tela === "pdv" ? "#B00020" : "#444",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
              transition: "0.2s",
            }}
          >
            PDV
          </button>

          <button
            onClick={() => setTela("produtos")}
            style={{
              background: tela === "produtos" ? "#B00020" : "#444",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
              transition: "0.2s",
            }}
          >
            Estoque
          </button>

          <button
            onClick={() => setTela("caixa")}
            style={{
              background: tela === "caixa" ? "#B00020" : "#444",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
              transition: "0.2s",
            }}
          >
            Caixa
          </button>

          <button
            onClick={() => setTela("relatorio")}
            style={{
              background: tela === "relatorio" ? "#B00020" : "#444",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
              transition: "0.2s",
            }}
          >
            Relatorio
          </button>
        </div>
      </div>

      {/* 🔻 CONTEÚDO */}
      <div style={{ flex: 1 }}>
        {tela === "pdv" && <PDV />}
        {tela === "produtos" && <Produtos />}
        {tela === "caixa" && <Caixa />}
        {tela === "relatorio" && <Relatorio />}
      </div>
    </div>
  );
}
