import React, { useState } from "react";
import api from "../services/api";

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [cadastro, setCadastro] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (cadastro) {
        await api.post("/auth/register", {
          nome,
          email,
          senha,
        });

        alert("Conta criada com sucesso!");

        setCadastro(false);
        setNome("");
        setSenha("");

        return;
      }

      const resposta = await api.post(
        "/auth/login",
        {
          email,
          senha,
        }
      );

      localStorage.setItem("token", resposta.data.token);
      localStorage.setItem(
        "usuario",
        JSON.stringify(resposta.data.usuario)
      );

      onLoginSuccess();
    } catch (erro: any) {
      alert(
        erro.response?.data?.erro ||
          erro.response?.data?.mensagem ||
          "Erro ao conectar com o servidor."
      );
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">

        <h2>Controle de Ativos - TI</h2>

        <p className="login-subtitle">
          {cadastro
            ? "Criar nova conta"
            : "Acesso exclusivo para a equipe de TI"}
        </p>

        <form onSubmit={handleSubmit} className="login-form">

          {cadastro && (
            <div className="form-group">
              <label>Nome</label>

              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>E-mail</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Senha</label>

            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login">
            {cadastro ? "Criar Conta" : "Entrar"}
          </button>

        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            cursor: "pointer",
            color: "#2563eb",
            fontWeight: "bold",
          }}
          onClick={() => setCadastro(!cadastro)}
        >
          {cadastro
            ? "Já possui uma conta? Entrar"
            : "Criar uma conta"}
        </p>

      </div>
    </div>
  );
}