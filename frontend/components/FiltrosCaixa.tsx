import React from "react";

interface ExpenseCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
  is_active: boolean;
}

interface FiltrosCaixaProps {
  categorias: ExpenseCategory[];
  filtroCategoria: number | null;
  setFiltroCategoria: (id: number | null) => void;
}

export const FiltrosCaixa: React.FC<FiltrosCaixaProps> = ({
  categorias,
  filtroCategoria,
  setFiltroCategoria,
}) => {
  if (categorias.length === 0) return null;

  return (
    <div
      style={{
        background: "#fff",
        padding: "10px 14px",
        borderRadius: 8,
        marginBottom: 16,
        border: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>
        Filtrar por categoria:
      </span>
      <button
        onClick={() => setFiltroCategoria(null)}
        style={{
          padding: "3px 10px",
          borderRadius: 16,
          border: "1px solid #e5e7eb",
          background: filtroCategoria === null ? "#10b981" : "#fff",
          color: filtroCategoria === null ? "#fff" : "#374151",
          cursor: "pointer",
          fontSize: 11,
          whiteSpace: "nowrap",
        }}
      >
        Todos
      </button>
      {categorias.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setFiltroCategoria(cat.id)}
          style={{
            padding: "3px 10px",
            borderRadius: 16,
            border: `1px solid ${cat.color}`,
            background: filtroCategoria === cat.id ? cat.color : "#fff",
            color: filtroCategoria === cat.id ? "#fff" : cat.color,
            cursor: "pointer",
            fontSize: 11,
            whiteSpace: "nowrap",
          }}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};
