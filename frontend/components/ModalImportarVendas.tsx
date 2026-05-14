import React from "react";

interface ModalImportarVendasProps {
  showModalImportarVendas: boolean;
  setShowModalImportarVendas: (show: boolean) => void;
  importFile: File | null;
  setImportFile: (file: File | null) => void;
  importPreview: any[];
  importing: boolean;
  previewCSV: (file: File) => void;
  importarVendasCSV: () => void;
}

export const ModalImportarVendas: React.FC<ModalImportarVendasProps> = ({
  showModalImportarVendas,
  setShowModalImportarVendas,
  importFile,
  setImportFile,
  importPreview,
  importing,
  previewCSV,
  importarVendasCSV,
}) => {
  if (!showModalImportarVendas) return null;

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
      onClick={() => setShowModalImportarVendas(false)}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          width: "90%",
          maxWidth: 650,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: "0 0 20px 0", fontSize: 20 }}>
          Importar Vendas (CSV)
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
            cliente,valor,data,pagamento
            <br />
            João Silva,150.00,05/01/2026,pix
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 11, color: "#10b981" }}>
            ✅ Datas no formato DD/MM/AAAA são convertidas automaticamente
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
              Preview:
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
                      Cliente
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
                      Pagamento
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {importPreview.map((row, idx) => (
                    <tr key={idx}>
                      <td
                        style={{
                          padding: "6px 8px",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        {row.data_original || "N/A"}
                      </td>
                      <td
                        style={{
                          padding: "6px 8px",
                          border: "1px solid #e5e7eb",
                          color: "#10b981",
                        }}
                      >
                        {row.data_convertida || "N/A"}
                      </td>
                      <td
                        style={{
                          padding: "6px 8px",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        {row.cliente || row.customer_name || "N/A"}
                      </td>
                      <td
                        style={{
                          padding: "6px 8px",
                          border: "1px solid #e5e7eb",
                          textAlign: "right",
                        }}
                      >
                        {row.valor || row.total || "N/A"}
                      </td>
                      <td
                        style={{
                          padding: "6px 8px",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        {row.pagamento || row.payment_method || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => {
              setShowModalImportarVendas(false);
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
            onClick={importarVendasCSV}
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
      </div>
    </div>
  );
};
