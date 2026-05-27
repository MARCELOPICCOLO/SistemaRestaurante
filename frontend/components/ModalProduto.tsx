import React, { useState, useEffect } from "react";

interface Category {
  id: number;
  name: string;
  restaurant_id: number;
}

interface FormData {
  id?: number;
  name: string;
  product_code: string;
  price: number;
  quantity: number;
  category_id: number;
}

interface ModalProdutoProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  editando: boolean;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  categorias: Category[];
  salvarProduto: () => void;
  produtosExistentes?: Array<{ id: number; product_code: string }>;
}

export const ModalProduto: React.FC<ModalProdutoProps> = ({
  showModal,
  setShowModal,
  editando,
  formData,
  setFormData,
  categorias,
  salvarProduto,
  produtosExistentes = [],
}) => {
  const [priceInput, setPriceInput] = useState("");
  const [quantityInput, setQuantityInput] = useState("");
  const [codigoError, setCodigoError] = useState("");

  // Verificar se o código já existe (ignorando o próprio produto em edição)
  const verificarCodigoDuplicado = (codigo: string) => {
    if (!codigo || codigo.trim() === "") {
      setCodigoError("");
      return true;
    }

    const existe = produtosExistentes.some(
      (p) => p.product_code === codigo && (!editando || p.id !== formData.id),
    );

    if (existe) {
      setCodigoError(
        "❌ Este código já está em uso. Por favor, use outro código.",
      );
      return false;
    } else {
      setCodigoError("");
      return true;
    }
  };

  const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setFormData({ ...formData, product_code: value });
    verificarCodigoDuplicado(value);
  };

  useEffect(() => {
    if (formData.price === 0) {
      setPriceInput("");
    } else {
      setPriceInput(formData.price.toString());
    }
    setQuantityInput(formData.quantity.toString());
    setCodigoError("");
  }, [formData.price, formData.quantity, showModal, formData.id]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^\d,.]/g, "");
    value = value.replace(",", ".");
    const parts = value.split(".");
    if (parts.length > 2) {
      value = parts[0] + "." + parts.slice(1).join("");
    }
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + "." + parts[1].substring(0, 2);
    }
    setPriceInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData({ ...formData, price: numValue });
    } else if (value === "" || value === "-") {
      setFormData({ ...formData, price: 0 });
    }
  };

  const handlePriceBlur = () => {
    if (priceInput === "" || priceInput === "-") {
      setPriceInput("");
      setFormData({ ...formData, price: 0 });
    } else {
      const numValue = parseFloat(priceInput);
      if (!isNaN(numValue)) {
        const formatted = numValue.toFixed(2);
        setPriceInput(formatted);
        setFormData({ ...formData, price: numValue });
      }
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\D/g, "");
    if (value.length > 1 && value.startsWith("0")) {
      value = value.replace(/^0+/, "");
    }
    if (value === "") {
      value = "0";
    }
    setQuantityInput(value);
    const numValue = Math.max(0, parseInt(value, 10) || 0);
    setFormData({ ...formData, quantity: numValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar código duplicado antes de salvar
    if (formData.product_code && formData.product_code.trim() !== "") {
      const existe = produtosExistentes.some(
        (p) =>
          p.product_code === formData.product_code &&
          (!editando || p.id !== formData.id),
      );

      if (existe) {
        setCodigoError(
          "❌ Este código já está em uso. Por favor, use outro código.",
        );
        return;
      }
    }

    salvarProduto();
  };

  if (!showModal) return null;

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
        zIndex: 1000,
      }}
      // REMOVIDO o onClick que fechava o modal ao clicar fora
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          width: "90%",
          maxWidth: 500,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <h2 style={{ margin: "0 0 20px 0", fontSize: 20 }}>
          {editando ? "Editar Produto" : "Novo Produto"}
        </h2>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Nome: <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Ex: X-Burguer"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              fontSize: 14,
              outline: "none",
            }}
            autoFocus
            required
          />
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
            Código:
          </label>
          <input
            type="text"
            placeholder="Ex: BURG001 (deixe em branco para gerar automático)"
            value={formData.product_code}
            onChange={handleCodigoChange}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 6,
              border: codigoError ? "1px solid #dc2626" : "1px solid #e5e7eb",
              fontSize: 14,
              outline: "none",
            }}
          />
          {codigoError && (
            <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>
              {codigoError}
            </div>
          )}
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
            💡 Dica: Deixe em branco para o sistema gerar automaticamente
          </div>
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
            Categoria: <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <select
            value={formData.category_id}
            onChange={(e) =>
              setFormData({ ...formData, category_id: Number(e.target.value) })
            }
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              fontSize: 14,
              outline: "none",
              cursor: "pointer",
            }}
            required
          >
            <option value={0}>Selecione uma categoria</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
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
            Preço (R$): <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="0,00"
            value={priceInput}
            onChange={handlePriceChange}
            onBlur={handlePriceBlur}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              fontSize: 14,
              outline: "none",
            }}
            required
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Estoque:
          </label>
          <input
            type="text"
            placeholder="0"
            value={quantityInput}
            onChange={handleQuantityChange}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={() => setShowModal(false)}
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
            type="submit"
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              border: "none",
              background: "#10b981",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {editando ? "Atualizar" : "Criar"}
          </button>
        </div>
      </form>
    </div>
  );
};
