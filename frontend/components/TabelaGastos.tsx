import React from "react";

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  category_id: number;
  type: "entrada" | "saida";
  category?: {
    id: number;
    name: string;
    icon: string;
    color: string;
  };
  source?: "pdv" | "manual";
}

interface TabelaGastosProps {
  transacoesPorData: { [key: string]: Transaction[] };
  diasExpandidos: { [key: string]: boolean };
  totalEntradasPorData: { [key: string]: number };
  totalSaidasPorData: { [key: string]: number };
  saldoPorData: { [key: string]: number };
  loading: boolean;
  formatDate: (dateString: string) => string;
  formatCurrency: (value: any) => string;
  toggleDia: (data: string) => void;
  removerTransacao: (id: number, type: string, source?: string) => void;
}

export const TabelaGastos: React.FC<TabelaGastosProps> = ({
  transacoesPorData,
  diasExpandidos,
  totalEntradasPorData,
  totalSaidasPorData,
  saldoPorData,
  loading,
  formatDate,
  formatCurrency,
  toggleDia,
  removerTransacao,
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>Carregando...</div>
    );
  }

  if (Object.keys(transacoesPorData).length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          background: "#fff",
          borderRadius: 8,
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
        <p>Nenhuma transação registrada neste mês</p>
      </div>
    );
  }

  return (
    <>
      {Object.keys(transacoesPorData)
        .sort((a, b) => b.localeCompare(a))
        .map((data) => {
          // TODAS AS DATAS COMEÇAM MINIMIZADAS (FECHADAS)
          // Se o estado não existir, assume false (fechado)
          const estaExpandido = diasExpandidos[data] === true;
          const transacoesDoDia = transacoesPorData[data];
          const totalEntradasDia = totalEntradasPorData[data] || 0;
          const totalSaidasDia = totalSaidasPorData[data] || 0;
          const saldoDia = saldoPorData[data] || 0;

          return (
            <div key={data} style={{ marginBottom: 12 }}>
              {/* CABEÇALHO DO DIA */}
              <div
                onClick={() => toggleDia(data)}
                style={{
                  background: estaExpandido ? "#f3f4f6" : "#fff",
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>
                    {estaExpandido ? "▼" : "▶"}
                  </span>
                  <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
                    📅 {formatDate(data)}
                  </h3>
                  <span style={{ fontSize: 10, color: "#6b7280" }}>
                    ({transacoesDoDia.length}{" "}
                    {transacoesDoDia.length === 1 ? "item" : "itens"})
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontSize: 10, color: "#10b981" }}>
                    Entradas: {formatCurrency(totalEntradasDia)}
                  </span>
                  <span style={{ fontSize: 10, color: "#dc2626" }}>
                    Saídas: {formatCurrency(totalSaidasDia)}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: saldoDia >= 0 ? "#10b981" : "#dc2626",
                    }}
                  >
                    Saldo: {formatCurrency(saldoDia)}
                  </span>
                </div>
              </div>

              {/* TABELA DO DIA - EXPANSÍVEL (SÓ MOSTRA SE ESTIVER EXPANDIDO) */}
              {estaExpandido && (
                <div style={{ marginTop: 6, overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      background: "#fff",
                      borderRadius: 8,
                      borderCollapse: "collapse",
                      fontSize: 12,
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "#f9fafb",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        <th
                          style={{
                            padding: "6px 10px",
                            textAlign: "left",
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          Descrição
                        </th>
                        <th
                          style={{
                            padding: "6px 10px",
                            textAlign: "left",
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          Categoria
                        </th>
                        <th
                          style={{
                            padding: "6px 10px",
                            textAlign: "left",
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          Tipo
                        </th>
                        <th
                          style={{
                            padding: "6px 10px",
                            textAlign: "right",
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          Valor
                        </th>
                        <th
                          style={{
                            padding: "6px 10px",
                            textAlign: "center",
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transacoesDoDia.map((t: Transaction) => (
                        <tr
                          key={`${t.type}-${t.id}`}
                          style={{ borderBottom: "1px solid #f0f0f0" }}
                        >
                          <td
                            style={{ padding: "6px 10px", fontSize: 11 }}
                            title={t.description}
                          >
                            {t.description.length > 35
                              ? t.description.substring(0, 35) + "..."
                              : t.description}
                          </td>
                          <td style={{ padding: "6px 10px" }}>
                            {t.type === "entrada" ? (
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "2px 6px",
                                  borderRadius: 12,
                                  fontSize: 9,
                                  background: "#d1fae5",
                                  color: "#059669",
                                }}
                              >
                                PDV
                              </span>
                            ) : t.category ? (
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "2px 6px",
                                  borderRadius: 12,
                                  fontSize: 9,
                                  background: `${t.category.color}15`,
                                  color: t.category.color,
                                }}
                              >
                                {t.category.name}
                              </span>
                            ) : (
                              <span style={{ fontSize: 10, color: "#9ca3af" }}>
                                Sem categoria
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "6px 10px", fontSize: 11 }}>
                            {t.type === "entrada" ? "Entrada" : "Saída"}
                          </td>
                          <td
                            style={{
                              padding: "6px 10px",
                              textAlign: "right",
                              fontSize: 11,
                              fontWeight: 600,
                              color:
                                t.type === "entrada" ? "#10b981" : "#dc2626",
                            }}
                          >
                            {formatCurrency(t.amount)}
                          </td>
                          <td
                            style={{
                              padding: "6px 10px",
                              textAlign: "center",
                            }}
                          >
                            {t.type === "saida" && (
                              <button
                                onClick={() =>
                                  removerTransacao(t.id, t.type, t.source)
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                  fontSize: 14,
                                  cursor: "pointer",
                                  color: "#dc2626",
                                }}
                                title="Remover"
                              >
                                🗑️
                              </button>
                            )}
                            {t.type === "entrada" && (
                              <span style={{ fontSize: 10, color: "#9ca3af" }}>
                                PDV
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
    </>
  );
};
