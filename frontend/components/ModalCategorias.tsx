import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faTimes,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

interface Category {
  id: number;
  name: string;
  restaurant_id: number;
}

interface ModalCategoriasProps {
  showModalCategoria: boolean;
  setShowModalCategoria: (show: boolean) => void;
  categorias: Category[];
  editandoCategoria: Category | null;
  setEditandoCategoria: (cat: Category | null) => void;
  novaCategoria: { name: string };
  setNovaCategoria: (cat: { name: string }) => void;
  adicionarCategoria: () => void;
  editarCategoria: () => void;
  excluirCategoria: (id: number, name: string) => void;
}

export const ModalCategorias: React.FC<ModalCategoriasProps> = ({
  showModalCategoria,
  setShowModalCategoria,
  categorias,
  editandoCategoria,
  setEditandoCategoria,
  novaCategoria,
  setNovaCategoria,
  adicionarCategoria,
  editarCategoria,
  excluirCategoria,
}) => {
  if (!showModalCategoria) return null;

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
        zIndex: 1001,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowModalCategoria(false);
          setEditandoCategoria(null);
        }
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          width: "90%",
          maxWidth: 500,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: "0 0 20px 0", fontSize: 20 }}>
          Gerenciar Categorias
        </h2>

        <div
          style={{
            marginBottom: 20,
            padding: 16,
            background: "#f9fafb",
            borderRadius: 8,
          }}
        >
          <h3 style={{ margin: "0 0 12px 0", fontSize: 14 }}>Nova Categoria</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="Nome da categoria"
              value={novaCategoria.name}
              onChange={(e) => setNovaCategoria({ name: e.target.value })}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                fontSize: 14,
                outline: "none",
              }}
            />
            <button
              onClick={adicionarCategoria}
              style={{
                padding: "8px 16px",
                background: "#10b981",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Adicionar
            </button>
          </div>
        </div>

        <div>
          <h3 style={{ margin: "0 0 12px 0", fontSize: 14 }}>
            Categorias Existentes
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {categorias.map((cat) => (
              <div
                key={cat.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                }}
              >
                {editandoCategoria?.id === cat.id ? (
                  <div style={{ flex: 1, display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      value={editandoCategoria.name}
                      onChange={(e) =>
                        setEditandoCategoria({
                          ...editandoCategoria,
                          name: e.target.value,
                        })
                      }
                      style={{
                        flex: 1,
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid #e5e7eb",
                        fontSize: 14,
                      }}
                      autoFocus
                    />
                    <button
                      onClick={editarCategoria}
                      style={{
                        padding: "6px 12px",
                        background: "#10b981",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      <FontAwesomeIcon icon={faSave} />
                    </button>
                    <button
                      onClick={() => setEditandoCategoria(null)}
                      style={{
                        padding: "6px 12px",
                        background: "#6b7280",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span style={{ fontSize: 14 }}>{cat.name}</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => setEditandoCategoria(cat)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#6b7280",
                          fontSize: 16,
                        }}
                        title="Editar"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => excluirCategoria(cat.id, cat.name)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#dc2626",
                          fontSize: 16,
                        }}
                        title="Excluir"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            setShowModalCategoria(false);
            setEditandoCategoria(null);
          }}
          style={{
            marginTop: 20,
            width: "100%",
            padding: "10px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "#fff",
            color: "#374151",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
