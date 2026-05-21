// components/pdv/MesasMobile.tsx
import React from "react";

interface Comanda {
  orderId: number;
  customerName: string;
  items: any[];
}

interface MesasMobileProps {
  comandas: Record<string, Comanda[]>;
  mesaAtual: string;
  novaMesa: string;
  onNovaMesaChange: (value: string) => void;
  onAdicionarMesa: () => void;
  onMesaSelect: (mesa: string, comandaId: number | null) => void;
  onMenuClick: (event: React.MouseEvent<HTMLDivElement>, mesa: string) => void;
  setActivePanel: (panel: string) => void;
}

const MesasMobile: React.FC<MesasMobileProps> = ({
  comandas,
  mesaAtual,
  novaMesa,
  onNovaMesaChange,
  onAdicionarMesa,
  onMesaSelect,
  onMenuClick,
  setActivePanel,
}) => {
  return (
    <div style={{ padding: "12px", background: "#1f2937", minHeight: "100vh" }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            type="number"
            value={novaMesa}
            onChange={(e) => onNovaMesaChange(e.target.value)}
            placeholder="Nº mesa"
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 6,
              border: "1px solid #374151",
              fontSize: 14,
              outline: "none",
              background: "#374151",
              color: "#fff",
              textAlign: "center",
            }}
            onKeyPress={(e) => e.key === "Enter" && onAdicionarMesa()}
          />
          <button
            onClick={onAdicionarMesa}
            style={{
              padding: "10px 20px",
              borderRadius: 6,
              border: "none",
              background: "#10b981",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Adicionar
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
          gap: 10,
        }}
      >
        {Object.keys(comandas)
          .sort((a, b) => {
            const numA = parseInt(a.replace("mesa-", ""));
            const numB = parseInt(b.replace("mesa-", ""));
            return numA - numB;
          })
          .map((mesa) => {
            const comandasDaMesa = comandas[mesa] || [];
            const ocupada = comandasDaMesa.length > 0;
            const isActive = mesaAtual === mesa;
            const numeroMesa = mesa.replace("mesa-", "");

            return (
              <div
                key={mesa}
                onClick={() => {
                  onMesaSelect(
                    mesa,
                    comandasDaMesa.length > 0
                      ? comandasDaMesa[0].orderId
                      : null,
                  );
                  setActivePanel("cardapio");
                }}
                style={{
                  position: "relative",
                  background: isActive
                    ? "#374151"
                    : ocupada
                      ? "#1e3a2f"
                      : "#111827",
                  borderRadius: 8,
                  padding: "12px 4px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  border: isActive ? "2px solid #10b981" : "1px solid #374151",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: ocupada ? "#10b981" : "#6b7280",
                  }}
                />
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#fff",
                    fontFamily: "monospace",
                  }}
                >
                  {numeroMesa.padStart(2, "0")}
                </div>
                {ocupada && (
                  <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 4 }}>
                    {comandasDaMesa.length} comanda(s)
                  </div>
                )}
                <div
                  style={{
                    position: "absolute",
                    bottom: 4,
                    right: 6,
                    background: "rgba(0,0,0,0.6)",
                    borderRadius: 4,
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMenuClick(e, mesa);
                  }}
                >
                  <span style={{ color: "#fff", fontSize: 14 }}>⋮</span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default MesasMobile;
