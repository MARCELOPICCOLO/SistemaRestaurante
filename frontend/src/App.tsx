import { useState } from "react";
import Produtos from "./pages/Produtos";
import Caixa from "./pages/Caixa";
import Relatorio from "./pages/Relatorio";
import Dashboard from "./pages/Dashboard";
import GestaoPontosVenda from "./pages/GestaoPontosVenda";
import GestaoVendas from "./pages/GestaoVendas";

// import Estoque from "./pages/Estoque"; // Remova se não existir
// import Comandas from "./pages/Comandas";
// import Equipe from "./pages/Equipe";

export default function App() {
  const [tela, setTela] = useState("dashboard");

  return (
    <div style={{ height: "100vh", background: "#FAFAFA", overflow: "auto" }}>
      {tela === "dashboard" && <Dashboard setTela={setTela} />}
      {tela === "gestao_pontos" && <GestaoPontosVenda setTela={setTela} />}
      {tela === "produtos" && <Produtos setTela={setTela} />}
      {tela === "caixa" && <Caixa setTela={setTela} />}
      {tela === "relatorio" && <Relatorio />}
      {tela === "vendas" && <GestaoVendas setTela={setTela} />}
      {/* {tela === "equipe" && <Equipe />} */}
      {/* {tela === "estoque" && <Estoque setTela={setTela} />} */}
    </div>
  );
}
