import React, { useState, useEffect } from "react";

export default function PDV() {
  const [mesaAtual, setMesaAtual] = useState("");
  const [comandas, setComandas] = useState({});
  const [orders, setOrders] = useState([]);
  const [novaMesa, setNovaMesa] = useState("");

  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [menuMesa, setMenuMesa] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [filtroProduto, setFiltroProduto] = useState("");

  // Estado para modal de finalizar
  const [modalFinalizar, setModalFinalizar] = useState(false);

  // Estado para responsividade
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activePanel, setActivePanel] = useState("mesas"); // "mesas", "cardapio", "comanda"

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [resProducts, resCategories, resTables, resOrders] =
          await Promise.all([
            fetch("http://localhost:8000/api/products?restaurant_id=1"),
            fetch("http://localhost:8000/api/categories?restaurant_id=1"),
            fetch("http://localhost:8000/api/tables?restaurant_id=1"),
            fetch("http://localhost:8000/api/orders?restaurant_id=1"),
          ]);

        const productsData = await resProducts.json();
        const categoriesData = await resCategories.json();
        const tablesData = await resTables.json();
        const ordersData = await resOrders.json();

        setProdutos(productsData);
        setCategorias(categoriesData);
        setMesas(tablesData);
        setOrders(ordersData);

        const comandasIniciais = {};
        tablesData.forEach((t) => {
          comandasIniciais[`mesa-${t.number}`] = [];
        });

        setComandas(comandasIniciais);

        if (tablesData.length > 0) {
          setMesaAtual(`mesa-${tablesData[0].number}`);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }

    loadData();
  }, []);

  const adicionarMesa = async () => {
    const numeroMesa = Number(novaMesa);

    if (!Number.isInteger(numeroMesa) || numeroMesa <= 0) {
      return alert("Digite um número válido");
    }

    try {
      const response = await fetch("http://localhost:8000/api/tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          restaurant_id: 1,
          number: numeroMesa,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Erro ao criar mesa");
        return;
      }

      const nomeMesa = `mesa-${data.number}`;

      setMesas((prev) => [...prev, data]);
      setComandas((prev) => ({ ...prev, [nomeMesa]: [] }));
      setMesaAtual(nomeMesa);
      setNovaMesa("");
    } catch (error) {
      console.error(error);
    }
  };

  const removerMesa = async (mesaNome) => {
    const mesa = mesas.find((m) => `mesa-${m.number}` === mesaNome);
    if (!mesa) return;

    if (
      window.confirm(`Tem certeza que deseja excluir a mesa ${mesa.number}?`)
    ) {
      try {
        const response = await fetch(
          `http://localhost:8000/api/tables/${mesa.id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          alert("Erro ao excluir mesa");
          return;
        }

        setMesas((prev) => prev.filter((m) => m.id !== mesa.id));
        setComandas((prev) => {
          const newComandas = { ...prev };
          delete newComandas[mesaNome];
          return newComandas;
        });

        if (mesaAtual === mesaNome) {
          const firstMesa = Object.keys(comandas).find((m) => m !== mesaNome);
          setMesaAtual(firstMesa || "");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getOrderByMesa = (mesaNome) => {
    const mesa = mesas.find((m) => `mesa-${m.number}` === mesaNome);
    if (!mesa) return null;

    return orders.find((o) => o.table_id === mesa.id && o.status === "aberto");
  };

  const abrirComanda = async (mesaNome) => {
    const mesa = mesas.find((m) => `mesa-${m.number}` === mesaNome);
    if (!mesa) return;

    const comandaExistente = getOrderByMesa(mesaNome);
    if (comandaExistente) {
      alert("Esta mesa já possui uma comanda aberta!");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          restaurant_id: 1,
          table_id: mesa.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Erro ao abrir comanda");
        return;
      }

      const novaOrder = data.order || data;
      setOrders((prev) => [...prev, novaOrder]);
      setComandas((prev) => ({ ...prev, [mesaNome]: [] }));

      alert(`Comanda aberta para a mesa ${mesa.number}!`);
      setMenuMesa(null);
      if (isMobile) {
        setActivePanel("cardapio");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao abrir comanda");
    }
  };

  const finalizarComanda = async () => {
    if (comanda.length === 0) {
      alert("Adicione itens à comanda");
      return;
    }

    const order = getOrderByMesa(mesaAtual);
    if (!order) {
      alert("Nenhuma comanda aberta para esta mesa");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/orders/${order.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            status: "fechado",
            total: total,
          }),
        },
      );

      if (!response.ok) {
        alert("Erro ao finalizar comanda");
        return;
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: "fechado" } : o)),
      );

      setComandas({ ...comandas, [mesaAtual]: [] });

      alert(`Comanda finalizada! Total: R$ ${total.toFixed(2)}`);
      setModalFinalizar(false);
      if (isMobile) {
        setActivePanel("mesas");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao finalizar comanda");
    }
  };

  const addItem = (produto) => {
    if (!mesaAtual) {
      alert("Selecione uma mesa primeiro");
      return;
    }

    const order = getOrderByMesa(mesaAtual);

    if (!order) {
      alert("Abra uma comanda primeiro");
      return;
    }

    const itens = comandas[mesaAtual] || [];
    const existe = itens.find((i) => i.id === produto.id);

    let novos;

    if (existe) {
      novos = itens.map((i) =>
        i.id === produto.id ? { ...i, qtd: i.qtd + 1 } : i,
      );
    } else {
      novos = [
        ...itens,
        {
          id: produto.id,
          name: produto.name,
          price: Number(produto.price),
          qtd: 1,
        },
      ];
    }

    setComandas((prev) => ({ ...prev, [mesaAtual]: novos }));
  };

  const alterarQtd = (id, delta) => {
    const itens = comandas[mesaAtual] || [];

    const novos = itens
      .map((item) =>
        item.id === id ? { ...item, qtd: item.qtd + delta } : item,
      )
      .filter((item) => item.qtd > 0);

    setComandas((prev) => ({
      ...prev,
      [mesaAtual]: novos,
    }));
  };

  const handleMenuClick = (event, mesa) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX - 140,
    });
    setMenuMesa(menuMesa === mesa ? null : mesa);
  };

  const comanda = comandas[mesaAtual] || [];
  const total = comanda.reduce((sum, i) => sum + i.price * i.qtd, 0);

  const produtosFiltrados = produtos.filter((produto) =>
    produto.name.toLowerCase().includes(filtroProduto.toLowerCase()),
  );

  const ModalFinalizarComanda = ({ onClose }) => {
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
        onClick={onClose}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 24,
            width: "90%",
            maxWidth: 400,
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 24 }}>Finalizar Comanda</h2>
            <p style={{ margin: "8px 0 0", color: "#6b7280" }}>
              Mesa {mesaAtual?.replace("mesa-", "")}
            </p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                background: "#f3f4f6",
                padding: 16,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 14 }}>Total de itens:</span>
                <span style={{ fontWeight: "bold" }}>{comanda.length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14 }}>Valor total:</span>
                <span
                  style={{ fontSize: 18, fontWeight: "bold", color: "#059669" }}
                >
                  R$ {total.toFixed(2)}
                </span>
              </div>
            </div>
            <p style={{ fontSize: 14, color: "#374151", textAlign: "center" }}>
              Confirmar o fechamento da comanda?
            </p>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={onClose}
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
              onClick={finalizarComanda}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 8,
                border: "none",
                background: "#ef4444",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Finalizar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ComandaItem = ({ item }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 12px",
        marginBottom: 4,
        background: "#f9fafb",
        borderRadius: 6,
        fontSize: isMobile ? 14 : 13,
      }}
    >
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontWeight: 500 }}>{item.name}</span>
        <span style={{ color: "#6b7280", fontSize: isMobile ? 12 : 11 }}>
          R$ {item.price.toFixed(2)}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontWeight: "bold",
            minWidth: 35,
            textAlign: "center",
            fontSize: isMobile ? 14 : 13,
          }}
        >
          {item.qtd}x
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => alterarQtd(item.id, -1)}
            style={{
              width: isMobile ? 32 : 22,
              height: isMobile ? 32 : 22,
              borderRadius: 6,
              border: "none",
              background: "#fee2e2",
              color: "#dc2626",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: isMobile ? 16 : 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            -
          </button>
          <button
            onClick={() => alterarQtd(item.id, 1)}
            style={{
              width: isMobile ? 32 : 22,
              height: isMobile ? 32 : 22,
              borderRadius: 6,
              border: "none",
              background: "#d1fae5",
              color: "#059669",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: isMobile ? 16 : 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );

  // Navegação mobile
  const MobileNav = () => (
    <div
      style={{
        display: "flex",
        background: "#1f2937",
        borderBottom: "1px solid #374151",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <button
        onClick={() => setActivePanel("mesas")}
        style={{
          flex: 1,
          padding: "12px",
          background: activePanel === "mesas" ? "#10b981" : "transparent",
          color: activePanel === "mesas" ? "#fff" : "#9ca3af",
          border: "none",
          fontWeight: "bold",
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        Mesas
      </button>
      <button
        onClick={() => setActivePanel("cardapio")}
        style={{
          flex: 1,
          padding: "12px",
          background: activePanel === "cardapio" ? "#10b981" : "transparent",
          color: activePanel === "cardapio" ? "#fff" : "#9ca3af",
          border: "none",
          fontWeight: "bold",
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        Cardápio
      </button>
      <button
        onClick={() => setActivePanel("comanda")}
        style={{
          flex: 1,
          padding: "12px",
          background: activePanel === "comanda" ? "#10b981" : "transparent",
          color: activePanel === "comanda" ? "#fff" : "#9ca3af",
          border: "none",
          fontWeight: "bold",
          cursor: "pointer",
          fontSize: 14,
          position: "relative",
        }}
      >
        Comanda
        {comanda.length > 0 && (
          <span
            style={{
              position: "absolute",
              top: 4,
              right: 20,
              background: "#ef4444",
              color: "#fff",
              borderRadius: "50%",
              width: 18,
              height: 18,
              fontSize: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {comanda.length}
          </span>
        )}
      </button>
    </div>
  );

  // Sidebar Desktop
  const SidebarDesktop = () => (
    <div
      style={{
        background: "#1f2937",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "280px",
      }}
    >
      <div style={{ padding: "16px", borderBottom: "1px solid #374151" }}>
        <h1
          style={{
            margin: 0,
            marginBottom: 12,
            color: "#fff",
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          Mesas
        </h1>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            type="number"
            value={novaMesa}
            onChange={(e) => setNovaMesa(e.target.value)}
            placeholder="Nº"
            style={{
              width: "70px",
              padding: "6px 8px",
              borderRadius: 4,
              border: "1px solid #374151",
              fontSize: 13,
              outline: "none",
              background: "#374151",
              color: "#fff",
              textAlign: "center",
            }}
            onKeyPress={(e) => e.key === "Enter" && adicionarMesa()}
          />
          <button
            onClick={adicionarMesa}
            style={{
              flex: 1,
              padding: "6px 8px",
              borderRadius: 4,
              border: "none",
              background: "#10b981",
              color: "#fff",
              fontWeight: 500,
              cursor: "pointer",
              fontSize: 12,
              whiteSpace: "nowrap",
            }}
          >
            Adicionar
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))",
            gap: 8,
          }}
        >
          {Object.keys(comandas)
            .sort((a, b) => {
              const numA = parseInt(a.replace("mesa-", ""));
              const numB = parseInt(b.replace("mesa-", ""));
              return numA - numB;
            })
            .map((mesa) => {
              const order = getOrderByMesa(mesa);
              const ocupada = !!order && order.status === "aberto";
              const isActive = mesaAtual === mesa;
              const itensCount = comandas[mesa]?.length || 0;
              const numeroMesa = mesa.replace("mesa-", "");

              return (
                <div
                  key={mesa}
                  onClick={() => setMesaAtual(mesa)}
                  style={{
                    position: "relative",
                    background: isActive
                      ? "#374151"
                      : ocupada
                        ? "#1e3a2f"
                        : "#111827",
                    borderRadius: 6,
                    padding: "10px 4px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    border: isActive
                      ? "1px solid #10b981"
                      : "1px solid #374151",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: ocupada ? "#10b981" : "#6b7280",
                    }}
                  />
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "#fff",
                      fontFamily: "monospace",
                    }}
                  >
                    {numeroMesa.padStart(2, "0")}
                  </div>
                  {ocupada && itensCount > 0 && (
                    <div
                      style={{ fontSize: 9, color: "#9ca3af", marginTop: 2 }}
                    >
                      {itensCount}
                    </div>
                  )}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 2,
                      right: 4,
                      background: "rgba(0,0,0,0.6)",
                      borderRadius: 3,
                      width: 16,
                      height: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuClick(e, mesa);
                    }}
                  >
                    <span
                      style={{ color: "#fff", fontSize: 10, lineHeight: 1 }}
                    >
                      ⋮
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div
        style={{
          padding: "10px 16px",
          borderTop: "1px solid #374151",
          background: "#111827",
        }}
      >
        <div style={{ fontSize: 11, color: "#9ca3af", textAlign: "center" }}>
          Total: {Object.keys(comandas).length} | Ocup:{" "}
          {
            Object.keys(comandas).filter(
              (m) => getOrderByMesa(m)?.status === "aberto",
            ).length
          }
        </div>
      </div>
    </div>
  );

  // Painel de Mesas Mobile
  const MesasMobile = () => (
    <div style={{ padding: "12px", background: "#1f2937", minHeight: "100vh" }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            type="number"
            value={novaMesa}
            onChange={(e) => setNovaMesa(e.target.value)}
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
            onKeyPress={(e) => e.key === "Enter" && adicionarMesa()}
          />
          <button
            onClick={adicionarMesa}
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
            const order = getOrderByMesa(mesa);
            const ocupada = !!order && order.status === "aberto";
            const isActive = mesaAtual === mesa;
            const itensCount = comandas[mesa]?.length || 0;
            const numeroMesa = mesa.replace("mesa-", "");

            return (
              <div
                key={mesa}
                onClick={() => {
                  setMesaAtual(mesa);
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
                {ocupada && itensCount > 0 && (
                  <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 4 }}>
                    {itensCount} itens
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
                    handleMenuClick(e, mesa);
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

  // Cardápio Mobile
  const CardapioMobile = () => (
    <div style={{ padding: "12px", background: "#FAFAFA", minHeight: "100vh" }}>
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18 }}>Cardápio</h2>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            Mesa: {mesaAtual?.replace("mesa-", "") || "-"}
          </div>
        </div>
        <input
          type="text"
          placeholder="Buscar produto..."
          value={filtroProduto}
          onChange={(e) => setFiltroProduto(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            fontSize: 14,
            outline: "none",
            background: "#fff",
          }}
        />
      </div>

      <div>
        {categorias.map((cat) => {
          const produtosCategoria = produtosFiltrados.filter(
            (p) => p.category?.id === cat.id,
          );
          if (produtosCategoria.length === 0) return null;

          return (
            <div key={cat.id} style={{ marginBottom: 20 }}>
              <h3
                style={{
                  margin: "0 0 8px 0",
                  padding: "6px 10px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#6b7280",
                  background: "#f3f4f6",
                  borderRadius: 6,
                }}
              >
                {cat.name}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {produtosCategoria.map((p) => {
                  const comandaAberta =
                    getOrderByMesa(mesaAtual)?.status === "aberto";
                  return (
                    <div
                      key={p.id}
                      onClick={() => comandaAberta && addItem(p)}
                      style={{
                        cursor: comandaAberta ? "pointer" : "not-allowed",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px",
                        background: "#fff",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        opacity: comandaAberta ? 1 : 0.5,
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 500 }}>
                        {p.name}
                      </span>
                      <span
                        style={{
                          color: "#059669",
                          fontWeight: "bold",
                          fontSize: 14,
                        }}
                      >
                        R$ {Number(p.price).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {mesaAtual && getOrderByMesa(mesaAtual)?.status !== "aberto" && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: "#fef3c7",
            borderRadius: 8,
            textAlign: "center",
            fontSize: 13,
            color: "#92400e",
          }}
        >
          Abra uma comanda no menu das mesas (⋮)
        </div>
      )}
    </div>
  );

  // Comanda Mobile
  const ComandaMobile = () => (
    <div
      style={{
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #e5e7eb",
          background: "#fff",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Comanda</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
          Mesa {mesaAtual?.replace("mesa-", "") || "?"}
          {getOrderByMesa(mesaAtual)?.status === "aberto" && (
            <span style={{ color: "#10b981", marginLeft: 8 }}>● Aberta</span>
          )}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
        {comanda.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#9ca3af",
              padding: "40px 20px",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <p style={{ fontSize: 14 }}>Nenhum item</p>
            <p style={{ fontSize: 12 }}>
              Selecione uma mesa e adicione produtos
            </p>
          </div>
        ) : (
          comanda.map((item) => <ComandaItem key={item.id} item={item} />)
        )}
      </div>

      <div
        style={{
          padding: "16px",
          borderTop: "1px solid #e5e7eb",
          background: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 16 }}>Total</span>
          <span style={{ fontWeight: "bold", fontSize: 20, color: "#059669" }}>
            R$ {total.toFixed(2)}
          </span>
        </div>
        <button
          style={{
            width: "100%",
            padding: "12px",
            background:
              getOrderByMesa(mesaAtual)?.status === "aberto"
                ? "#10b981"
                : "#9ca3af",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            cursor:
              getOrderByMesa(mesaAtual)?.status === "aberto"
                ? "pointer"
                : "not-allowed",
            fontSize: 16,
          }}
          onClick={() => setModalFinalizar(true)}
          disabled={getOrderByMesa(mesaAtual)?.status !== "aberto"}
        >
          Finalizar Comanda
        </button>
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <>
          <MobileNav />
          {activePanel === "mesas" && <MesasMobile />}
          {activePanel === "cardapio" && <CardapioMobile />}
          {activePanel === "comanda" && <ComandaMobile />}
        </>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr 320px",
            height: "100vh",
            overflow: "hidden",
          }}
        >
          <SidebarDesktop />

          {/* Cardápio Desktop */}
          <div
            style={{
              padding: "12px",
              background: "#FAFAFA",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div style={{ marginBottom: 12, flexShrink: 0 }}>
              <h2
                style={{
                  margin: 0,
                  marginBottom: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#333",
                }}
              >
                Cardápio
              </h2>
              <input
                type="text"
                placeholder="Buscar produto..."
                value={filtroProduto}
                onChange={(e) => setFiltroProduto(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                  outline: "none",
                  background: "#fff",
                }}
              />
            </div>

            <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
              {categorias.map((cat) => {
                const produtosCategoria = produtosFiltrados.filter(
                  (p) => p.category?.id === cat.id,
                );
                if (produtosCategoria.length === 0) return null;

                return (
                  <div key={cat.id} style={{ marginBottom: 16 }}>
                    <h3
                      style={{
                        margin: "0 0 8px 0",
                        padding: "4px 8px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#6b7280",
                        background: "#f3f4f6",
                        borderRadius: 4,
                      }}
                    >
                      {cat.name}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      {produtosCategoria.map((p) => {
                        const comandaAberta =
                          getOrderByMesa(mesaAtual)?.status === "aberto";
                        return (
                          <div
                            key={p.id}
                            onClick={() => comandaAberta && addItem(p)}
                            style={{
                              cursor: comandaAberta ? "pointer" : "not-allowed",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "8px 12px",
                              background: "#fff",
                              borderRadius: 6,
                              border: "1px solid #e5e7eb",
                              opacity: comandaAberta ? 1 : 0.5,
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              if (comandaAberta) {
                                e.currentTarget.style.background = "#f9fafb";
                                e.currentTarget.style.borderColor = "#10b981";
                                e.currentTarget.style.transform =
                                  "translateX(4px)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (comandaAberta) {
                                e.currentTarget.style.background = "#fff";
                                e.currentTarget.style.borderColor = "#e5e7eb";
                                e.currentTarget.style.transform =
                                  "translateX(0)";
                              }
                            }}
                          >
                            <span style={{ fontSize: 13, fontWeight: 500 }}>
                              {p.name}
                            </span>
                            <span
                              style={{
                                color: "#059669",
                                fontWeight: 600,
                                fontSize: 13,
                              }}
                            >
                              R$ {Number(p.price).toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {mesaAtual && getOrderByMesa(mesaAtual)?.status !== "aberto" && (
              <div
                style={{
                  marginTop: 12,
                  padding: 8,
                  background: "#fef3c7",
                  borderRadius: 6,
                  textAlign: "center",
                  fontSize: 11,
                  color: "#92400e",
                  flexShrink: 0,
                }}
              >
                Abra uma comanda no menu (⋮)
              </div>
            )}
          </div>

          {/* Comanda Desktop */}
          <div
            style={{
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              height: "100vh",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #e5e7eb",
                background: "#fff",
                flexShrink: 0,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                Comanda
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6b7280" }}>
                Mesa {mesaAtual?.replace("mesa-", "") || "?"}
                {getOrderByMesa(mesaAtual)?.status === "aberto" && (
                  <span style={{ color: "#10b981", marginLeft: 8 }}>
                    Aberta
                  </span>
                )}
              </p>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
              {comanda.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#9ca3af",
                    padding: "30px 12px",
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                  <p style={{ fontSize: 12 }}>Nenhum item</p>
                </div>
              ) : (
                comanda.map((item) => <ComandaItem key={item.id} item={item} />)
              )}
            </div>

            <div
              style={{
                padding: "12px 16px",
                borderTop: "1px solid #e5e7eb",
                background: "#fff",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span style={{ fontWeight: 600, fontSize: 14 }}>Total</span>
                <span
                  style={{ fontWeight: "bold", fontSize: 18, color: "#059669" }}
                >
                  R$ {total.toFixed(2)}
                </span>
              </div>
              <button
                style={{
                  width: "100%",
                  padding: "8px",
                  background:
                    getOrderByMesa(mesaAtual)?.status === "aberto"
                      ? "#10b981"
                      : "#9ca3af",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor:
                    getOrderByMesa(mesaAtual)?.status === "aberto"
                      ? "pointer"
                      : "not-allowed",
                  fontSize: 13,
                }}
                onClick={() => setModalFinalizar(true)}
                disabled={getOrderByMesa(mesaAtual)?.status !== "aberto"}
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown Menu */}
      {menuMesa && (
        <div
          style={{
            position: "fixed",
            background: "#fff",
            borderRadius: 6,
            padding: "4px 0",
            fontSize: isMobile ? 14 : 13,
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            minWidth: isMobile ? 150 : 130,
            top: menuPosition.top,
            left: menuPosition.left,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            onClick={() => {
              abrirComanda(menuMesa);
              setMenuMesa(null);
            }}
            style={{
              padding: "10px 16px",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            Abrir Comanda
          </div>
          <div
            onClick={() => {
              removerMesa(menuMesa);
              setMenuMesa(null);
            }}
            style={{
              padding: "10px 16px",
              cursor: "pointer",
              transition: "background 0.2s",
              color: "#dc2626",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            Excluir Mesa
          </div>
        </div>
      )}

      {/* Modal Finalizar */}
      {modalFinalizar && (
        <ModalFinalizarComanda onClose={() => setModalFinalizar(false)} />
      )}
    </>
  );
}
