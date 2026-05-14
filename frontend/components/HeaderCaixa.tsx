import React from "react";

interface HeaderCaixaProps {
  mesSelecionado: number;
  setMesSelecionado: (mes: number) => void;
  anoSelecionado: number;
  setAnoSelecionado: (ano: number) => void;
  showEntradas: boolean;
  setShowEntradas: (show: boolean) => void;
  showSaidas: boolean;
  setShowSaidas: (show: boolean) => void;
  totalEntradas: number;
  totalSaidas: number;
  saldoGeral: number;
  formatCurrency: (value: any) => string;
  anos: number[];
  meses: { value: number; label: string }[];
}

export const HeaderCaixa: React.FC<HeaderCaixaProps> = ({
  mesSelecionado,
  setMesSelecionado,
  anoSelecionado,
  setAnoSelecionado,
  showEntradas,
  setShowEntradas,
  showSaidas,
  setShowSaidas,
  totalEntradas,
  totalSaidas,
  saldoGeral,
  formatCurrency,
  anos,
  meses,
}) => {
  return (
    <div
      style={{
        background: "#fff",
        padding: "16px 20px",
        borderRadius: 8,
        marginBottom: 20,
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
          Fluxo de Caixa
        </h2>
        <div style={{ display: "flex", gap: 10 }}>
          <select
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(Number(e.target.value))}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              background: "#fff",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {meses.map((mes) => (
              <option key={mes.value} value={mes.value}>
                {mes.label}
              </option>
            ))}
          </select>
          <select
            value={anoSelecionado}
            onChange={(e) => setAnoSelecionado(Number(e.target.value))}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              background: "#fff",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {anos.map((ano) => (
              <option key={ano} value={ano}>
                {ano}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          padding: "10px 0",
          borderTop: "1px solid #e5e7eb",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>Entradas</div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#10b981",
                }}
              >
                {formatCurrency(totalEntradas)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>Saídas</div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#dc2626",
                }}
              >
                {formatCurrency(totalSaidas)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>Saldo</div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: saldoGeral >= 0 ? "#10b981" : "#dc2626",
                }}
              >
                {formatCurrency(saldoGeral)}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <button
              onClick={() => setShowEntradas(!showEntradas)}
              style={{
                padding: "5px 14px",
                borderRadius: 20,
                border: "1px solid #10b981",
                background: showEntradas ? "#10b981" : "#fff",
                color: showEntradas ? "#fff" : "#10b981",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              Entradas
            </button>
            <button
              onClick={() => setShowSaidas(!showSaidas)}
              style={{
                padding: "5px 14px",
                borderRadius: 20,
                border: "1px solid #dc2626",
                background: showSaidas ? "#dc2626" : "#fff",
                color: showSaidas ? "#fff" : "#dc2626",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              Saídas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
