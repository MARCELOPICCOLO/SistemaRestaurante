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

  // Estados para múltiplas comandas
  const [comandaSelecionada, setComandaSelecionada] = useState(null);
  const [modalAbrirComanda, setModalAbrirComanda] = useState(null);
  const [nomeComanda, setNomeComanda] = useState("");
  const [showSelectComanda, setShowSelectComanda] = useState(false);
  const [produtoPendente, setProdutoPendente] = useState(null);

  // Estado para modal de finalizar
  const [modalFinalizar, setModalFinalizar] = useState(false);

  // Estado para responsividade
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activePanel, setActivePanel] = useState("mesas");

  // EStado forma de pagamento
  const [formaPagamento, setFormaPagamento] = useState("");

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
        // Carregar produtos, categorias e mesas
        const [resProducts, resCategories, resTables] = await Promise.all([
          fetch("http://localhost:8000/api/products?restaurant_id=1"),
          fetch("http://localhost:8000/api/categories?restaurant_id=1"),
          fetch("http://localhost:8000/api/tables?restaurant_id=1"),
        ]);

        const productsData = await resProducts.json();
        const categoriesData = await resCategories.json();
        const tablesData = await resTables.json();

        setProdutos(productsData);
        setCategorias(categoriesData);
        setMesas(tablesData);

        // Carregar comandas abertas do backend
        const resOrders = await fetch(
          "http://localhost:8000/api/orders?restaurant_id=1",
        );
        const ordersData = await resOrders.json();

        console.log("Comandas carregadas do backend:", ordersData);
        setOrders(ordersData);

        // Estruturar as comandas por mesa
        const comandasEstruturadas = {};

        // Inicializar array vazio para cada mesa
        tablesData.forEach((t) => {
          comandasEstruturadas[`mesa-${t.number}`] = [];
        });

        // Para cada comanda aberta, adicionar à sua mesa correspondente
        ordersData.forEach((order) => {
          if (order.status === "aberto") {
            // Encontrar a mesa pelo table_id
            const mesa = tablesData.find((t) => t.id === order.table_id);
            if (mesa) {
              const mesaNome = `mesa-${mesa.number}`;

              // Buscar os itens da comanda com orderItemId
              let items = [];
              if (order.items && order.items.length > 0) {
                items = order.items.map((item) => ({
                  id: item.product_id,
                  orderItemId: item.id, // GUARDA O order_item_id
                  name:
                    item.product?.name ||
                    item.name ||
                    `Produto ${item.product_id}`,
                  product_code: item.product?.product_code,
                  price: parseFloat(item.price),
                  qtd: item.quantity,
                }));
              }

              comandasEstruturadas[mesaNome].push({
                orderId: order.id,
                customerName: order.customer_name || `Comanda ${order.id}`,
                items: items,
              });
            }
          }
        });

        setComandas(comandasEstruturadas);

        // Selecionar primeira mesa se houver
        if (tablesData.length > 0) {
          const mesaInicial = `mesa-${tablesData[0].number}`;
          setMesaAtual(mesaInicial);

          // Selecionar primeira comanda da mesa se existir
          if (comandasEstruturadas[mesaInicial].length > 0) {
            setComandaSelecionada(comandasEstruturadas[mesaInicial][0].orderId);
          } else {
            setComandaSelecionada(null);
          }
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
        // ✅ TRATAR ERRO DE MESA DUPLICADA
        if (response.status === 409) {
          alert(data.message);
        } else {
          alert(data.message || "Erro ao criar mesa");
        }
        return;
      }

      const nomeMesa = `mesa-${data.number}`;

      setMesas((prev) => [...prev, data]);
      setComandas((prev) => ({ ...prev, [nomeMesa]: [] }));
      setMesaAtual(nomeMesa);
      setNovaMesa("");
      setComandaSelecionada(null);
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com o servidor");
    }
  };

  const removerMesa = async (mesaNome) => {
    const mesa = mesas.find((m) => `mesa-${m.number}` === mesaNome);
    if (!mesa) return;

    if (
      window.confirm(`Tem certeza que deseja excluir a mesa ${mesa.number}?`)
    ) {
      try {
        // Primeiro, fechar todas as comandas abertas da mesa
        const comandasDaMesa = comandas[mesaNome] || [];
        for (const comanda of comandasDaMesa) {
          await fetch(
            `http://localhost:8000/api/orders/${comanda.orderId}/close`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            },
          );
        }

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

        // Atualizar orders removendo as comandas
        setOrders((prev) =>
          prev.filter((o) => !comandasDaMesa.some((c) => c.orderId === o.id)),
        );

        if (mesaAtual === mesaNome) {
          const firstMesa = Object.keys(comandas).find((m) => m !== mesaNome);
          setMesaAtual(firstMesa || "");
          setComandaSelecionada(null);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getOrderById = (orderId) => {
    return orders.find((o) => o.id === orderId);
  };

  const getComandasDaMesa = (mesaNome) => {
    return comandas[mesaNome] || [];
  };

  const abrirComanda = async (mesaNome, nomeCliente) => {
    const mesa = mesas.find((m) => `mesa-${m.number}` === mesaNome);
    if (!mesa) return;

    if (!nomeCliente || nomeCliente.trim() === "") {
      alert("Digite um nome para identificar a comanda");
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
          customer_name: nomeCliente,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Erro ao abrir comanda");
        return;
      }

      const novaOrder = data.order || data;
      setOrders((prev) => [...prev, novaOrder]);

      setComandas((prev) => ({
        ...prev,
        [mesaNome]: [
          ...(prev[mesaNome] || []),
          { orderId: novaOrder.id, items: [], customerName: nomeCliente },
        ],
      }));

      alert(`Comanda de ${nomeCliente} aberta para a mesa ${mesa.number}!`);
      setModalAbrirComanda(null);
      setNomeComanda("");
      setMenuMesa(null);

      if (isMobile) {
        setActivePanel("cardapio");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao abrir comanda");
    }
  };

  const getComandaItems = (mesaNome, orderId) => {
    const comandaMesa = comandas[mesaNome] || [];
    const comanda = comandaMesa.find((c) => c.orderId === orderId);
    return comanda ? comanda.items : [];
  };

  const addItem = async (produto, orderId) => {
    if (!mesaAtual) {
      alert("Selecione uma mesa primeiro");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/orders/${orderId}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            product_id: produto.id,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        alert(error.message || "Erro ao adicionar item");
        return;
      }

      const data = await response.json();
      const novoOrderItem = data.item; // Pega o order_item_id do backend

      const comandaMesa = comandas[mesaAtual] || [];
      const comandaIndex = comandaMesa.findIndex((c) => c.orderId === orderId);

      if (comandaIndex === -1) {
        alert("Comanda não encontrada");
        return;
      }

      const comandaAtual = comandaMesa[comandaIndex];
      const itens = comandaAtual.items || [];
      const existe = itens.find((i) => i.id === produto.id);

      let novosItens;

      if (existe) {
        // Se já existe, incrementa quantidade
        novosItens = itens.map((i) =>
          i.id === produto.id ? { ...i, qtd: i.qtd + 1 } : i,
        );
      } else {
        // Se não existe, adiciona novo com orderItemId
        novosItens = [
          ...itens,
          {
            id: produto.id,
            orderItemId: novoOrderItem?.id, // GUARDA O order_item_id
            name: produto.name,
            product_code: produto.product_code,
            price: Number(produto.price),
            qtd: 1,
          },
        ];
      }

      const novasComandas = [...comandaMesa];
      novasComandas[comandaIndex] = { ...comandaAtual, items: novosItens };

      setComandas((prev) => ({
        ...prev,
        [mesaAtual]: novasComandas,
      }));
    } catch (error) {
      console.error(error);
      alert("Erro ao adicionar item");
    }
  };

  const alterarQtd = async (orderId, productId, delta, orderItemId) => {
    if (!orderItemId) {
      console.error("orderItemId é undefined!");
      alert("Erro: ID do item não encontrado. Recarregue a página.");
      return;
    }

    const comandaMesa = comandas[mesaAtual] || [];
    const comandaIndex = comandaMesa.findIndex((c) => c.orderId === orderId);

    if (comandaIndex === -1) return;

    const comandaAtual = comandaMesa[comandaIndex];
    const itemEncontrado = comandaAtual.items.find((i) => i.id === productId);

    if (!itemEncontrado) return;

    const novaQuantidade = itemEncontrado.qtd + delta;

    try {
      if (novaQuantidade > 0) {
        // Usar orderItemId para atualizar
        const response = await fetch(
          `http://localhost:8000/api/order-items/${orderItemId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              quantity: novaQuantidade,
            }),
          },
        );

        if (!response.ok) {
          alert("Erro ao atualizar quantidade");
          return;
        }
      } else {
        // Usar orderItemId para deletar
        const response = await fetch(
          `http://localhost:8000/api/order-items/${orderItemId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro detalhado:", errorData);
          alert("Erro ao remover item");
          return;
        }
      }

      // Atualizar frontend
      const itens = comandaAtual.items || [];
      const novosItens = itens
        .map((item) =>
          item.id === productId ? { ...item, qtd: item.qtd + delta } : item,
        )
        .filter((item) => item.qtd > 0);

      const novasComandas = [...comandaMesa];
      novasComandas[comandaIndex] = { ...comandaAtual, items: novosItens };

      setComandas((prev) => ({
        ...prev,
        [mesaAtual]: novasComandas,
      }));
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar quantidade");
    }
  };

  const finalizarComanda = async (orderId, formaPagamento) => {
    const order = getOrderById(orderId);
    if (!order) return;

    const comandaMesa = comandas[mesaAtual] || [];
    const comandaIndex = comandaMesa.findIndex((c) => c.orderId === orderId);
    if (comandaIndex === -1) return;

    const comandaAtual = comandaMesa[comandaIndex];
    const totalComanda = comandaAtual.items.reduce(
      (sum, i) => sum + i.price * i.qtd,
      0,
    );

    if (comandaAtual.items.length === 0) {
      alert("Adicione itens à comanda");
      return;
    }

    if (!formaPagamento) {
      alert("Selecione a forma de pagamento");
      return;
    }

    const isBalcao = comandaAtual.customerName === "Balcão";

    try {
      const response = await fetch(
        `http://localhost:8000/api/orders/${orderId}/close`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            payment_method: formaPagamento,
            total: totalComanda,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        alert(error.message || "Erro ao finalizar comanda");
        return;
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "fechado" } : o)),
      );

      const novasComandas = comandaMesa.filter((c) => c.orderId !== orderId);
      setComandas((prev) => ({ ...prev, [mesaAtual]: novasComandas }));

      alert(
        `Comanda de ${comandaAtual.customerName} finalizada!\nTotal: R$ ${totalComanda.toFixed(2)}\nPagamento: ${formaPagamento}`,
      );

      if (comandaSelecionada === orderId) {
        setComandaSelecionada(
          novasComandas.length > 0 ? novasComandas[0].orderId : null,
        );
      }

      if (isBalcao && isMobile) {
        setActivePanel("mesas");
      }

      setModalFinalizar(false);
      setFormaPagamento("");
    } catch (error) {
      console.error(error);
      alert("Erro ao finalizar comanda");
    }
  };
  const handleAddItemClick = (produto) => {
    if (!mesaAtual) {
      alert("Selecione uma mesa primeiro");
      return;
    }

    const comandasDaMesa = comandas[mesaAtual] || [];

    if (comandasDaMesa.length === 0) {
      alert(
        "Nenhuma comanda aberta para esta mesa. Abra uma comanda primeiro!",
      );
      return;
    }

    if (comandasDaMesa.length === 1) {
      addItem(produto, comandasDaMesa[0].orderId);
    } else {
      setProdutoPendente(produto);
      setShowSelectComanda(true);
    }
  };

  const handleMenuClick = (event, mesa) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX - 140,
    });
    setMenuMesa(menuMesa === mesa ? null : mesa);
  };

  const abrirVendaRapida = async () => {
    // Encontrar mesa balcão (número 0)
    const mesaBalcao = mesas.find((m) => m.number === 0);

    if (!mesaBalcao) {
      alert("Mesa de balcão não encontrada. Contate o administrador.");
      return;
    }

    const mesaNome = `mesa-${mesaBalcao.number}`;

    // Verificar se já tem comanda aberta no balcão
    const comandasBalcao = comandas[mesaNome] || [];
    const comandaAberta = comandasBalcao.find((c) => {
      const order = orders.find((o) => o.id === c.orderId);
      return order && order.status === "aberto";
    });

    if (comandaAberta) {
      // Reutilizar comanda existente
      setMesaAtual(mesaNome);
      setComandaSelecionada(comandaAberta.orderId);
      alert("Comanda de balcão já está aberta! Adicione os itens.");
    } else {
      // Abrir nova comanda
      await abrirComanda(mesaNome, "Balcão");
    }

    // Ir para o cardápio (mobile)
    if (isMobile) {
      setActivePanel("cardapio");
    }
  };

  // Adicione esta função no mesmo nível das outras funções (ex: ao lado de adicionarMesa, removerMesa, etc.)

  const abrirComandaBalcao = async (mesaNome) => {
    const mesa = mesas.find((m) => `mesa-${m.number}` === mesaNome);
    if (!mesa) return;

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
          customer_name: "Balcão",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Erro ao abrir comanda");
        return;
      }

      const novaOrder = data.order || data;
      setOrders((prev) => [...prev, novaOrder]);

      setComandas((prev) => ({
        ...prev,
        [mesaNome]: [
          ...(prev[mesaNome] || []),
          { orderId: novaOrder.id, items: [], customerName: "Balcão" },
        ],
      }));

      setMesaAtual(mesaNome);
      setComandaSelecionada(novaOrder.id);

      alert("Comanda do balcão aberta com sucesso!");

      if (isMobile) {
        setActivePanel("cardapio");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao abrir comanda do balcão");
    }
  };

  const comandaSelecionadaItems = comandaSelecionada
    ? getComandaItems(mesaAtual, comandaSelecionada)
    : [];
  const total = comandaSelecionadaItems.reduce(
    (sum, i) => sum + i.price * i.qtd,
    0,
  );

  const produtosFiltrados = produtos.filter((produto) => {
    const searchTerm = filtroProduto.toLowerCase();
    const matchesName = produto.name.toLowerCase().includes(searchTerm);
    const matchesCode =
      produto.product_code &&
      produto.product_code.toLowerCase().includes(searchTerm);
    return matchesName || matchesCode;
  });

  const comandasDaMesaAtual = comandas[mesaAtual] || [];

  // Modal para abrir comanda com nome
  const ModalAbrirComanda = ({ mesaNome, onClose }) => {
    const numeroMesa = mesaNome?.replace("mesa-", "");

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
            <h2 style={{ margin: 0, fontSize: 24 }}>Abrir Comanda</h2>
            <p style={{ margin: "8px 0 0", color: "#6b7280" }}>
              Mesa {numeroMesa}
            </p>
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
              Nome do cliente:
            </label>
            <input
              type="text"
              value={nomeComanda}
              onChange={(e) => setNomeComanda(e.target.value)}
              placeholder="Ex: João, Maria, Família Silva..."
              autoFocus
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 14,
                outline: "none",
              }}
              onKeyPress={(e) =>
                e.key === "Enter" && abrirComanda(mesaNome, nomeComanda)
              }
            />
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
              onClick={() => abrirComanda(mesaNome, nomeComanda)}
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
              Abrir
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modal para selecionar comanda ao adicionar item
  const ModalSelectComanda = ({ onClose }) => {
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
            <h2 style={{ margin: 0, fontSize: 20 }}>Selecionar Comanda</h2>
            <p style={{ margin: "8px 0 0", color: "#6b7280", fontSize: 14 }}>
              Para qual comanda deseja adicionar?
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {comandasDaMesaAtual.map((comanda) => (
              <button
                key={comanda.orderId}
                onClick={() => {
                  addItem(produtoPendente, comanda.orderId);
                  setShowSelectComanda(false);
                  setProdutoPendente(null);
                }}
                style={{
                  padding: "12px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: "#f9fafb",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f3f4f6";
                  e.currentTarget.style.borderColor = "#10b981";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f9fafb";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              >
                <div style={{ fontWeight: "bold", fontSize: 16 }}>
                  {comanda.customerName}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                  {comanda.items?.length || 0} itens | R${" "}
                  {(comanda.items || [])
                    .reduce((sum, i) => sum + i.price * i.qtd, 0)
                    .toFixed(2)}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            style={{
              width: "100%",
              marginTop: 16,
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
        </div>
      </div>
    );
  };

  // Modal de finalizar comanda com forma de pagamento
  const ModalFinalizarComanda = ({ onClose }) => {
    const comandaAtual = comandasDaMesaAtual.find(
      (c) => c.orderId === comandaSelecionada,
    );

    const opcoesPagamento = [
      { value: "dinheiro", label: "💰 Dinheiro", icon: "💵" },
      { value: "pix", label: "📱 PIX", icon: "📱" },
      { value: "credito", label: "💳 Cartão de Crédito", icon: "💳" },
      { value: "debito", label: "💳 Cartão de Débito", icon: "💳" },
    ];

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
            maxWidth: 450,
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 24 }}>Finalizar Comanda</h2>
            <p style={{ margin: "8px 0 0", color: "#6b7280" }}>
              Mesa {mesaAtual?.replace("mesa-", "")} -{" "}
              {comandaAtual?.customerName}
            </p>
          </div>

          {/* Resumo da comanda */}
          <div
            style={{
              background: "#f3f4f6",
              padding: 16,
              borderRadius: 8,
              marginBottom: 20,
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
              <span style={{ fontWeight: "bold" }}>
                {comandaSelecionadaItems.length}
              </span>
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

          {/* Forma de pagamento */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: 14,
                fontWeight: 500,
                color: "#374151",
              }}
            >
              Forma de pagamento:
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {opcoesPagamento.map((opcao) => (
                <button
                  key={opcao.value}
                  onClick={() => setFormaPagamento(opcao.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 8,
                    border:
                      formaPagamento === opcao.value
                        ? "2px solid #10b981"
                        : "1px solid #e5e7eb",
                    background:
                      formaPagamento === opcao.value ? "#f0fdf4" : "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (formaPagamento !== opcao.value) {
                      e.currentTarget.style.background = "#f9fafb";
                      e.currentTarget.style.borderColor = "#10b981";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formaPagamento !== opcao.value) {
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.borderColor = "#e5e7eb";
                    }
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 500 }}>
                    {opcao.label}
                  </span>
                  {formaPagamento === opcao.value && (
                    <span style={{ color: "#10b981", fontSize: 18 }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Ações */}
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
              onClick={() =>
                finalizarComanda(comandaSelecionada, formaPagamento)
              }
              disabled={!formaPagamento}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 8,
                border: "none",
                background: formaPagamento ? "#10b981" : "#9ca3af",
                color: "#fff",
                fontWeight: "bold",
                cursor: formaPagamento ? "pointer" : "not-allowed",
                opacity: formaPagamento ? 1 : 0.6,
              }}
            >
              Finalizar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 📦 Componente de item da comanda com código do produto e orderItemId
  const ComandaItemComponent = ({ item, orderId }) => (
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
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      <div
        style={{ flex: 2, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <span style={{ fontWeight: 500 }}>{item.name}</span>
        {item.product_code && (
          <span style={{ fontSize: 10, color: "#9ca3af" }}>
            Cód: {item.product_code}
          </span>
        )}
        {item.orderItemId && (
          <span style={{ fontSize: 9, color: "#6b7280" }}>
            ID: {item.orderItemId}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#6b7280", fontSize: isMobile ? 12 : 11 }}>
          R$ {item.price.toFixed(2)}
        </span>
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
            onClick={() => alterarQtd(orderId, item.id, -1, item.orderItemId)}
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
            onClick={() => alterarQtd(orderId, item.id, 1, item.orderItemId)}
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

  // 📦 Card de produto com código
  const ProductCard = ({ produto }) => {
    const comandaAberta = comandasDaMesaAtual.length > 0;
    return (
      <div
        onClick={() => comandaAberta && handleAddItemClick(produto)}
        style={{
          cursor: comandaAberta ? "pointer" : "not-allowed",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: isMobile ? "12px" : "8px 12px",
          background: "#fff",
          borderRadius: 6,
          border: "1px solid #e5e7eb",
          opacity: comandaAberta ? 1 : 0.5,
          transition: "all 0.2s",
          gap: 8,
        }}
        onMouseEnter={(e) => {
          if (comandaAberta) {
            e.currentTarget.style.background = "#f9fafb";
            e.currentTarget.style.borderColor = "#10b981";
            if (!isMobile) e.currentTarget.style.transform = "translateX(4px)";
          }
        }}
        onMouseLeave={(e) => {
          if (comandaAberta) {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.borderColor = "#e5e7eb";
            if (!isMobile) e.currentTarget.style.transform = "translateX(0)";
          }
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: isMobile ? 14 : 13, fontWeight: 500 }}>
            {produto.name}
          </div>
          {produto.product_code && (
            <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>
              {produto.product_code}
            </div>
          )}
        </div>
        <span
          style={{
            color: "#059669",
            fontWeight: "bold",
            fontSize: isMobile ? 14 : 13,
          }}
        >
          R$ {Number(produto.price).toFixed(2)}
        </span>
      </div>
    );
  };

  // Selector de comanda
  const ComandaSelector = () => (
    <div style={{ marginBottom: 12 }}>
      <label
        style={{
          fontSize: 12,
          color: "#6b7280",
          marginBottom: 4,
          display: "block",
        }}
      >
        Comanda:
      </label>
      <select
        value={comandaSelecionada || ""}
        onChange={(e) => setComandaSelecionada(Number(e.target.value))}
        style={{
          width: "100%",
          padding: "8px",
          borderRadius: 6,
          border: "1px solid #e5e7eb",
          fontSize: 13,
          background: "#fff",
          cursor: "pointer",
        }}
      >
        <option value="">Selecione uma comanda</option>
        {comandasDaMesaAtual.map((comanda) => (
          <option key={comanda.orderId} value={comanda.orderId}>
            {comanda.customerName} - {comanda.items?.length || 0} itens
          </option>
        ))}
      </select>
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
        {comandaSelecionada && comandaSelecionadaItems.length > 0 && (
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
            {comandaSelecionadaItems.length}
          </span>
        )}
      </button>
    </div>
  );

  const SidebarDesktop = () => {
    // Função para lidar com clique na mesa
    const handleMesaClick = async (mesa, comandasDaMesa) => {
      const mesaObj = mesas.find((m) => `mesa-${m.number}` === mesa);
      const isBalcao = mesaObj?.number === 0;

      if (isBalcao) {
        // Verificar se já tem comanda aberta no balcão
        const comandaAberta = comandasDaMesa.find((c) => {
          const order = orders.find((o) => o.id === c.orderId);
          return order && order.status === "aberto";
        });

        if (comandaAberta) {
          // Se já tem comanda aberta, apenas seleciona
          setMesaAtual(mesa);
          setComandaSelecionada(comandaAberta.orderId);
        } else {
          // Se não tem comanda aberta, abre uma nova
          await abrirComandaBalcao(mesa);
        }
      } else {
        // Mesa normal
        setMesaAtual(mesa);
        setComandaSelecionada(
          comandasDaMesa.length > 0 ? comandasDaMesa[0].orderId : null,
        );
      }
    };

    return (
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
                const comandasDaMesa = comandas[mesa] || [];
                const ocupada = comandasDaMesa.length > 0;
                const isActive = mesaAtual === mesa;
                const numeroMesa = mesa.replace("mesa-", "");
                const isBalcao = numeroMesa === "0" || numeroMesa === "00";

                // Verifica se tem comanda aberta no balcão
                const temComandaAberta =
                  isBalcao &&
                  comandasDaMesa.some((c) => {
                    const order = orders.find((o) => o.id === c.orderId);
                    return order && order.status === "aberto";
                  });

                return (
                  <div
                    key={mesa}
                    onClick={() => handleMesaClick(mesa, comandasDaMesa)}
                    style={{
                      position: "relative",
                      background: isBalcao
                        ? temComandaAberta
                          ? "#1e3a2f"
                          : "#10b981"
                        : isActive
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
                      {isBalcao ? "" : numeroMesa.padStart(2, "0")}
                    </div>
                    {isBalcao && (
                      <div
                        style={{
                          fontSize: 9,
                          color: "#fff",
                          marginTop: 2,
                          opacity: 0.9,
                        }}
                      >
                        {temComandaAberta ? "Atendendo" : "Clique para iniciar"}
                      </div>
                    )}
                    {!isBalcao && ocupada && (
                      <div
                        style={{ fontSize: 9, color: "#9ca3af", marginTop: 2 }}
                      >
                        {comandasDaMesa.length} comanda(s)
                      </div>
                    )}
                    {!isBalcao && (
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
                    )}
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
            Total: {Object.keys(comandas).length} | Comandas:{" "}
            {Object.values(comandas).reduce((sum, c) => sum + c.length, 0)}
          </div>
        </div>
      </div>
    );
  };

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
            const comandasDaMesa = comandas[mesa] || [];
            const ocupada = comandasDaMesa.length > 0;
            const isActive = mesaAtual === mesa;
            const numeroMesa = mesa.replace("mesa-", "");

            return (
              <div
                key={mesa}
                onClick={() => {
                  setMesaAtual(mesa);
                  setComandaSelecionada(
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
          placeholder="Buscar por nome ou código..."
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
                {produtosCategoria.map((p) => (
                  <ProductCard key={p.id} produto={p} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {comandasDaMesaAtual.length === 0 && mesaAtual && (
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
        </p>
      </div>

      <div style={{ padding: "12px" }}>
        <ComandaSelector />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px 12px" }}>
        {!comandaSelecionada ? (
          <div
            style={{
              textAlign: "center",
              color: "#9ca3af",
              padding: "40px 20px",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <p style={{ fontSize: 14 }}>Selecione uma comanda</p>
          </div>
        ) : comandaSelecionadaItems.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#9ca3af",
              padding: "40px 20px",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
            <p style={{ fontSize: 14 }}>Nenhum item</p>
            <p style={{ fontSize: 12 }}>Adicione produtos do cardápio</p>
          </div>
        ) : (
          comandaSelecionadaItems.map((item) => (
            <ComandaItemComponent
              key={item.id}
              item={item}
              orderId={comandaSelecionada}
            />
          ))
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
            background: comandaSelecionada ? "#10b981" : "#9ca3af",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            cursor: comandaSelecionada ? "pointer" : "not-allowed",
            fontSize: 16,
          }}
          onClick={() => comandaSelecionada && setModalFinalizar(true)}
          disabled={!comandaSelecionada}
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
                placeholder="Buscar por nome ou código..."
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
                      {produtosCategoria.map((p) => (
                        <ProductCard key={p.id} produto={p} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {comandasDaMesaAtual.length === 0 && mesaAtual && (
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
              </p>
            </div>

            <div style={{ padding: "12px" }}>
              <ComandaSelector />
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "0 12px 12px 12px",
              }}
            >
              {!comandaSelecionada ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#9ca3af",
                    padding: "30px 12px",
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                  <p style={{ fontSize: 12 }}>Selecione uma comanda</p>
                </div>
              ) : comandaSelecionadaItems.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#9ca3af",
                    padding: "30px 12px",
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🛒</div>
                  <p style={{ fontSize: 12 }}>Nenhum item</p>
                </div>
              ) : (
                comandaSelecionadaItems.map((item) => (
                  <ComandaItemComponent
                    key={item.id}
                    item={item}
                    orderId={comandaSelecionada}
                  />
                ))
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
                  background: comandaSelecionada ? "#10b981" : "#9ca3af",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: comandaSelecionada ? "pointer" : "not-allowed",
                  fontSize: 13,
                }}
                onClick={() => comandaSelecionada && setModalFinalizar(true)}
                disabled={!comandaSelecionada}
              >
                Finalizar Comanda
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
              setModalAbrirComanda(menuMesa);
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
            Nova Comanda
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

      {/* Modals */}
      {modalAbrirComanda && (
        <ModalAbrirComanda
          mesaNome={modalAbrirComanda}
          onClose={() => setModalAbrirComanda(null)}
        />
      )}
      {showSelectComanda && (
        <ModalSelectComanda
          onClose={() => {
            setShowSelectComanda(false);
            setProdutoPendente(null);
          }}
        />
      )}
      {modalFinalizar && (
        <ModalFinalizarComanda onClose={() => setModalFinalizar(false)} />
      )}
    </>
  );
}
