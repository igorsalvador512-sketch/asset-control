import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Equipamentos } from './pages/Equipamentos';

function NavLink({ to, icon, children }: { to: string; icon: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      style={{
        padding: '12px 16px',
        borderRadius: '10px',
        textDecoration: 'none',
        color: isActive ? '#ffffff' : '#94a3b8',
        background: isActive ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'transparent',
        fontWeight: isActive ? '700' : '500',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none',
        transition: 'all 0.2s ease'
      }}
    >
      <span style={{ fontSize: '18px' }}>{icon}</span>
      {children}
    </Link>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
        
        {/* SIDEBAR MODERNA DARK */}
        <aside style={{ width: '260px', background: '#0f172a', padding: '28px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ padding: '0 8px 28px 8px', borderBottom: '1px solid #1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: '800', fontSize: '18px' }}>
                TI
              </div>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
                  Gestão de TI
                </h2>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Asset Control v2.0</span>
              </div>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <NavLink to="/" icon="📊">Dashboard</NavLink>
              <NavLink to="/equipamentos" icon="💻">Equipamentos</NavLink>
            </nav>
          </div>

          <div style={{ padding: '16px', background: '#1e293b', borderRadius: '12px', color: '#94a3b8', fontSize: '12px' }}>
            <div style={{ color: '#ffffff', fontWeight: '700', marginBottom: '4px' }}>Sistema Ativo</div>
            <span>Servidor local conectado</span>
          </div>
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/equipamentos" element={<Equipamentos />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;