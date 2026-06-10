// components/pdv/SidebarPdv.tsx
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
  faPlus,
  faTrash,
  faUser,
  faUsers,
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";

interface PontoVenda {
  id: number;
  number: number;
  restaurant_id: number;
}

interface SidebarPdvProps {
  pontos: PontoVenda[];
  pontoAtual: string;
  novoPontoCodigo: string;
  onNovoPontoCodigoChange: (value: string) => void;
  onAdicionarPonto: () => void;
  onPontoClick: (ponto: string, comandasDoPonto: any[]) => void;
  onMenuClick: (event: React.MouseEvent<HTMLDivElement>, ponto: string) => void;
}

const SidebarPdv: React.FC<SidebarPdvProps> = ({
  pontos,
  pontoAtual,
  novoPontoCodigo,
  onNovoPontoCodigoChange,
  onAdicionarPonto,
  onPontoClick,
  onMenuClick,
}) => {
  return (
    <div
      style={{
        background: "#1f2937",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      {/* CABEÇALHO */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #374151" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: "#374151",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FontAwesomeIcon
              icon={faStore}
              style={{ fontSize: 18, color: "#10b981" }}
            />
          </div>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 600,
                color: "#fff",
              }}
            ></h2>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>
              Gerencie seus pontos
            </p>
          </div>
        </div>

        {/* Input de adicionar compacto */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#374151",
              borderRadius: 6,
              padding: "2px",
            }}
          >
            <input
              type="number"
              value={novoPontoCodigo}
              onChange={(e) => onNovoPontoCodigoChange(e.target.value)}
              placeholder="Número"
              style={{
                width: "100px",
                padding: "6px 10px",
                borderRadius: 6,
                border: "none",
                fontSize: 12,
                outline: "none",
                background: "#374151",
                color: "#fff",
              }}
              onKeyPress={(e) => e.key === "Enter" && onAdicionarPonto()}
            />
            <button
              onClick={onAdicionarPonto}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: "none",
                background: "#10b981",
                color: "#fff",
                fontWeight: 500,
                cursor: "pointer",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#059669";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#10b981";
              }}
            >
              <FontAwesomeIcon icon={faPlus} size="xs" />
              Adicionar
            </button>
          </div>
        </div>
      </div>

      {/* LISTA DE PONTOS */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
            gap: 12,
          }}
        >
          {pontos
            .sort((a, b) => a.number - b.number)
            .map((ponto) => {
              const isActive = pontoAtual === `ponto-${ponto.number}`;
              const isBalcao = ponto.number === 0;

              return (
                <div
                  key={ponto.id}
                  onClick={() => onPontoClick(`ponto-${ponto.number}`, [])}
                  style={{
                    position: "relative",
                    background: isBalcao
                      ? "#10b981"
                      : isActive
                        ? "#374151"
                        : "#111827",
                    borderRadius: 10,
                    padding: "12px 8px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    border: isActive
                      ? "1px solid #10b981"
                      : "1px solid #374151",
                    textAlign: "center",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0,0,0,0.2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Ícone estilizado */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: isBalcao
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(255,255,255,0.05)",
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 8px auto",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={isBalcao ? faUsers : faUser}
                      style={{
                        fontSize: 18,
                        color: isBalcao ? "#fff" : "#9ca3af",
                      }}
                    />
                  </div>

                  {/* Texto */}
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: "bold",
                      color: "#fff",
                      marginBottom: 2,
                    }}
                  >
                    {isBalcao
                      ? "Balcão"
                      : `Ponto ${ponto.number.toString().padStart(2, "0")}`}
                  </div>

                  <div
                    style={{
                      fontSize: 10,
                      color: "#9ca3af",
                    }}
                  >
                    {isBalcao ? "Atendimento geral" : "Ponto de venda"}
                  </div>

                  {/* Botão de menu (3 pontinhos) */}
                  {!isBalcao && (
                    <div
                      onClick={(e) => onMenuClick(e, `ponto-${ponto.number}`)}
                      style={{
                        position: "absolute",
                        bottom: 6,
                        right: 6,
                        background: "rgba(0,0,0,0.6)",
                        borderRadius: 4,
                        width: 22,
                        height: 22,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#10b981";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(0,0,0,0.6)";
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faEllipsisV}
                        style={{ fontSize: 10, color: "#fff" }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* RODAPÉ */}
      <div
        style={{
          padding: "10px 16px",
          borderTop: "1px solid #374151",
          background: "#111827",
        }}
      >
        <div style={{ fontSize: 10, color: "#9ca3af", textAlign: "center" }}>
          Total: {pontos.length} pontos
        </div>
      </div>
    </div>
  );
};

export default SidebarPdv;
