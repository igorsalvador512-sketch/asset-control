import { useState, useEffect } from "react";
import { Login } from "./pages/Login";

import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { Equipamentos } from "./pages/Equipamentos";

export function App() {
  const [usuario, setUsuario] = useState<any>(null);
  const [abaAtiva, setAbaAtiva] = useState("dashboard");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuarioSalvo = localStorage.getItem("usuario");

    if (token && usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, []);

  function handleLoginSuccess() {
    const usuarioSalvo = localStorage.getItem("usuario");

    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  }

  if (!usuario) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      <Sidebar
        abaAtiva={abaAtiva}
        setAbaAtiva={setAbaAtiva}
      />

      <div className="content">
        <div
          className="app-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            background: "#fff",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,.08)",
          }}
        >
          <span>
            Bem-vindo, <strong>{usuario.nome}</strong>
          </span>

          <button
            className="btn-excluir"
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>

        {abaAtiva === "dashboard" && <Dashboard />}
        {abaAtiva === "equipamentos" && <Equipamentos />}
      </div>
    </div>
  );
}

export default App;