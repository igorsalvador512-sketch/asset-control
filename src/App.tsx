import { useEffect, useState } from "react";
import { Login } from "./pages/Login";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { Equipamentos, type Equipamento } from "./pages/Equipamentos";
import api from "./services/api";

export function App() {
  const [usuario, setUsuario] = useState<any>(null);
  const [abaAtiva, setAbaAtiva] = useState("dashboard");
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [carregandoEquipamentos, setCarregandoEquipamentos] = useState(true);

  // ==========================================
  // RECUPERAR USUARIO LOGADO
  // ==========================================
  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuarioSalvo = localStorage.getItem("usuario");

    if (token && usuarioSalvo) {
      try {
        setUsuario(JSON.parse(usuarioSalvo));
      } catch {
        localStorage.removeItem("usuario");
      }
    }
  }, []);

  // ==========================================
  // CARREGAR EQUIPAMENTOS SOMENTE DA API
  // ==========================================
  useEffect(() => {
    if (!usuario) return;

    let ativo = true;

    async function carregarEquipamentos() {
      setCarregandoEquipamentos(true);

      try {
        const resposta = await api.get<Equipamento[]>("/equipamentos");

        const dados = Array.isArray(resposta.data)
          ? resposta.data
          : [];

        if (ativo) {
          setEquipamentos(dados);
        }
      } catch (erro) {
        console.error("Erro ao carregar equipamentos:", erro);

        if (ativo) {
          setEquipamentos([]);
        }
      } finally {
        if (ativo) {
          setCarregandoEquipamentos(false);
        }
      }
    }

    carregarEquipamentos();

    return () => {
      ativo = false;
    };
  }, [usuario]);

  // ==========================================
  // LOGIN
  // ==========================================
  function handleLoginSuccess() {
    const usuarioSalvo = localStorage.getItem("usuario");

    if (usuarioSalvo) {
      try {
        setUsuario(JSON.parse(usuarioSalvo));
      } catch {
        setUsuario(null);
      }
    }
  }

  // ==========================================
  // LOGOUT
  // ==========================================
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    setUsuario(null);
    setEquipamentos([]);
  }

  // ==========================================
  // TELA DE LOGIN
  // ==========================================
  if (!usuario) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // ==========================================
  // APLICACAO
  // ==========================================
  return (
    <div className="app-container">
      <Sidebar
        abaAtiva={abaAtiva}
        setAbaAtiva={setAbaAtiva}
      />

      <div className="content">

        {/* CABECALHO */}
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
            Bem-vindo,{" "}
            <strong>
              {usuario.nome || usuario.email}
            </strong>
          </span>

          <button
            className="btn-excluir"
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>

        {/* CARREGAMENTO */}
        {carregandoEquipamentos ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            Carregando equipamentos...
          </div>
        ) : (
          <>
            {/* DASHBOARD */}
            {abaAtiva === "dashboard" && (
              <Dashboard
                equipamentos={equipamentos}
              />
            )}

            {/* EQUIPAMENTOS */}
            {abaAtiva === "equipamentos" && (
              <Equipamentos
                equipamentos={equipamentos}
                setEquipamentos={setEquipamentos}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;