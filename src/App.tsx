import { useState, useEffect } from "react";
import { onAuthStateChanged, type User, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { Login } from "./pages/Login";

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Carregando sistema...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div>
      <div className="app-header">
        <span className="user-info">Usuário: <strong>{user.email}</strong></span>
        <button onClick={handleLogout} className="btn-excluir">Sair</button>
      </div>

      {/* Seu layout normal com Sidebar e Conteúdo entra aqui */}
    </div>
  );
}

export default App;