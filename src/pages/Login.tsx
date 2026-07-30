import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && senha) {
      localStorage.setItem('usuario_logado', email);
      onLoginSuccess();
    } else {
      alert('Por favor, preencha o e-mail e a senha.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Controle de Ativos - TI</h2>
        <p className="login-subtitle">Acesso exclusivo para a equipe de TI</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">E-mail corporativo</label>
            <input
              id="email"
              type="email"
              placeholder="seu.nome@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login">
            Entrar no Sistema
          </button>
        </form>
      </div>
    </div>
  );
}