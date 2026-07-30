import { useState, useEffect } from "react";
import { Login } from "./pages/Login";

// Importações das telas e componentes do seu projeto
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { Equipamentos } from "./pages/Equipamentos"; // Importe a tela de Equipamentos
// import { Manutencoes } from "./pages/Manutencoes"; // Se tiver outras páginas, importe aqui

export function App() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  // Estado que controla qual página está visível no momento
  const [abaAtiva, setAbaAtiva] = useState<string>("dashboard");

  // Checa se o usuário já fez login ao carregar a página
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario_logado");
    if (usuarioSalvo) {
      setUserEmail(usuarioSalvo);
    }
  }, []);

  const handleLoginSuccess = () => {
    const usuario = localStorage.getItem("usuario_logado");
    setUserEmail(usuario);
  };

  const handleLogout = () => {
    localStorage.removeItem("usuario_logado");
    setUserEmail(null);
  };

  // 1. Se NÃO estiver logado -> Mostra a tela de Login
  if (!userEmail) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. Se ESTIVER logado -> Renderiza o Dashboard com a Sidebar ativa
  return (
    <div className="app-container">
      {/* Passamos o estado e a função para a Sidebar saber qual botão marcar e alternar */}
      <Sidebar abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />

      <div className="content">
        {/* Barra superior de informações e Sair */}
        <div 
          className="app-header" 
          style={{ 
            display: "flex", 
            justify: "space-between", 
            alignItems: "center", 
            marginBottom: "20px",
            background: "#ffffff",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}
        >
          <span className="user-info" style={{ fontSize: "14px", color: "#64748b" }}>
            Conectado como: <strong style={{ color: "#0f172a" }}>{userEmail}</strong>
          </span>
          <button onClick={handleLogout} className="btn-excluir">
            Sair
          </button>
        </div>

        {/* Alternância das telas com base na abaAtiva */}
        {abaAtiva === "dashboard" && <Dashboard />}
        {abaAtiva === "equipamentos" && <Equipamentos />}
        {/* {abaAtiva === "manutencoes" && <Manutencoes />} */}
      </div>
    </div>
  );
}

export default App;