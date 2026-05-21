import { useState } from "react";
import PDV from "./pages/PDV";
import Produtos from "./pages/Produtos";
import Caixa from "./pages/Caixa";
import Relatorio from "./pages/Relatorio";
import Dashboard from "./pages/Dashboard";
import GestaoPontosVenda from "./pages/GestaoPontosVenda";
// import Estoque from "./pages/Estoque";
// import Comandas from "./pages/Comandas";
// import Equipe from "./pages/Equipe";

export default function App() {
  const [tela, setTela] = useState("dashboard");

  return (
    <div style={{ height: "100vh", background: "#FAFAFA", overflow: "auto" }}>
      {tela === "dashboard" && <Dashboard setTela={setTela} />}
      {tela === "gestao_pontos" && <GestaoPontosVenda setTela={setTela} />}
      {tela === "pdv" && <PDV />}
      {tela === "produtos" && <Produtos />}
      {tela === "estoque" && <Estoque />}
      {tela === "comandas" && <Comandas />}
      {tela === "caixa" && <Caixa />}
      {tela === "relatorio" && <Relatorio />}
      {tela === "equipe" && <Equipe />}
    </div>
  );
}
