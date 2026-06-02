import React from "react";

interface ModalImportarGastosProps {
  showModalImportarGastos: boolean;
  setShowModalImportarGastos: (show: boolean) => void;
  importFile: File | null;
  setImportFile: (file: File | null) => void;
  importPreview: any[];
  importing: boolean;
  previewCSV: (file: File) => void;
  importarGastosCSV: () => void;
}

export const ModalImportarGastos: React.FC<ModalImportarGastosProps> = ({
  showModalImportarGastos,
  setShowModalImportarGastos,
  importFile,
  setImportFile,
  importPreview,
  importing,
  previewCSV,
  importarGastosCSV,
}) => {
  if (!showModalImportarGastos) return null;

  // Função auxiliar para pegar o valor do campo independente do nome/case
  const getFieldValue = (row: any, fieldNames: string[]): string => {
    for (const name of fieldNames) {
      if (row[name] !== undefined && row[name] !== null && row[name] !== "") {
        return String(row[name]);
      }
      // Busca case insensitive
      const key = Object.keys(row).find(
        (k) => k.toLowerCase() === name.toLowerCase(),
      );
      if (
        key &&
        row[key] !== undefined &&
        row[key] !== null &&
        row[key] !== ""
      ) {
        return String(row[key]);
      }
    }
    return "N/A";
  };

  const formatPreviewDate = (dateStr: string): string => {
    if (!dateStr || dateStr === "N/A") return "N/A";
    // Se já estiver no formato ISO (YYYY-MM-DD)
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split("-");
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1003,
      }}
      onClick={() => setShowModalImportarGastos(false)}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          width: "90%",
          maxWidth: 750,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: "0 0 20px 0", fontSize: 20 }}>
          Importar Gastos (CSV)
        </h2>

        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: "#f3f4f6",
            borderRadius: 8,
          }}
        >
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>
            📋 Formato esperado:
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#6b7280" }}>
            <strong>Delimitador:</strong> ponto e vírgula (;) <br />
            <strong>Colunas:</strong> Data;Descrição;Valor;Categoria
            <br />
            Exemplo: 03/01/2026;AÇUCAR;13.99;2
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 11, color: "#10b981" }}>
            ✅ Datas nos formatos DD/MM/AAAA ou AAAA-MM-DD são aceitas
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#f59e0b" }}>
            💡 Categoria deve ser o ID numérico (ex: 2) ou o nome exato
          </p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Arquivo CSV:
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImportFile(file);
                previewCSV(file);
              }
            }}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
            }}
          />
        </div>

        {importPreview.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
              Preview (primeiras 5 linhas):
            </p>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  fontSize: 12,
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th
                      style={{
                        padding: "6px 8px",
                        border: "1px solid #e5e7eb",
                        textAlign: "left",
                      }}
                    >
                      Data Original
                    </th>
                    <th
                      style={{
                        padding: "6px 8px",
                        border: "1px solid #e5e7eb",
                        textAlign: "left",
                      }}
                    >
                      Data Convertida
                    </th>
                    <th
                      style={{
                        padding: "6px 8px",
                        border: "1px solid #e5e7eb",
                        textAlign: "left",
                      }}
                    >
                      Descrição
                    </th>
                    <th
                      style={{
                        padding: "6px 8px",
                        border: "1px solid #e5e7eb",
                        textAlign: "right",
                      }}
                    >
                      Valor
                    </th>
                    <th
                      style={{
                        padding: "6px 8px",
                        border: "1px solid #e5e7eb",
                        textAlign: "left",
                      }}
                    >
                      Categoria
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {importPreview.map((row, idx) => {
                    // Mapeamento direto - sem função getFieldValue
                    const dataOriginal =
                      row.data_original || row.Data || row.data || "N/A";
                    const descricao =
                      row.descricao ||
                      row.Descrição ||
                      row.description ||
                      "N/A";
                    const valor = row.valor || row.Valor || row.amount || "N/A";
                    const categoria =
                      row.categoria || row.Categoria || row.category || "N/A";

                    return (
                      <tr key={idx}>
                        <td
                          style={{
                            padding: "6px 8px",
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          {dataOriginal}
                        </td>
                        <td
                          style={{
                            padding: "6px 8px",
                            border: "1px solid #e5e7eb",
                            color: "#10b981",
                            fontWeight: 500,
                          }}
                        >
                          {formatPreviewDate(dataOriginal)}
                        </td>
                        <td
                          style={{
                            padding: "6px 8px",
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          {descricao}
                        </td>
                        <td
                          style={{
                            padding: "6px 8px",
                            border: "1px solid #e5e7eb",
                            textAlign: "right",
                          }}
                        >
                          {valor}
                        </td>
                        <td
                          style={{
                            padding: "6px 8px",
                            border: "1px solid #e5e7eb",
                            textAlign: "left",
                          }}
                        >
                          {categoria}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button
            onClick={() => {
              setShowModalImportarGastos(false);
              setImportFile(null);
            }}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#fff",
              color: "#374151",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={importarGastosCSV}
            disabled={!importFile || importing}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              border: "none",
              background: !importFile || importing ? "#9ca3af" : "#10b981",
              color: "#fff",
              fontWeight: "bold",
              cursor: !importFile || importing ? "not-allowed" : "pointer",
            }}
          >
            {importing ? "Importando..." : "Importar"}
          </button>
        </div>

        {importPreview.length === 0 && importFile && (
          <p style={{ fontSize: 12, color: "#ef4444", marginTop: 12 }}>
            ⚠️ Nenhum dado válido encontrado. Verifique se o arquivo está no
            formato correto.
          </p>
        )}
      </div>
    </div>
  );
};
