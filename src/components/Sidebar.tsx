import React from 'react';

interface SidebarProps {
  paginaAtual: string;
  setPaginaAtual: (pagina: string) => void;
}

export function Sidebar({ paginaAtual, setPaginaAtual }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'equipamentos', label: '💻 Equipamentos' },
    { id: 'manutençoes', label: '🔧 Manutenções' },
    { id: 'relatorios', label: '📈 Relatórios' },
    { id: 'configuracoes', label: '⚙️ Configurações' },
  ];

  return (
    <aside style={{
      width: '240px',
      minHeight: '100vh',
      background: '#0f172a',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      flexShrink: 0
    }}>
      <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '32px', paddingLeft: '8px', color: '#38bdf8' }}>
        AssetControl
      </h2>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {menuItems.map((item) => {
          const isActive = paginaAtual === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPaginaAtual(item.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 12px',
                borderRadius: '6px',
                background: isActive ? '#1e293b' : 'transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                fontWeight: isActive ? '600' : 'normal',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;