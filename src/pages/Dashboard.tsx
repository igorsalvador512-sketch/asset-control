import React, { useState, useEffect } from 'react';

interface Equipamento {
  id: string;
  nome: string;
  patrimonio: string;
  usuario: string;
  setorUsuario: string;
  valor: number;
}

export function Dashboard() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);

  // ESTADOS PARA OS FILTROS
  const [buscaTexto, setBuscaTexto] = useState('');
  const [setorFiltro, setSetorFiltro] = useState('TODOS');
  const [atribuicaoFiltro, setAtribuicaoFiltro] = useState<'TODOS' | 'EM_USO' | 'SEM_USO'>('TODOS');

  useEffect(() => {
    const carregarDados = () => {
      try {
        const salvos = localStorage.getItem('equipamentos_db');
        if (salvos) {
          const dados = JSON.parse(salvos);
          if (Array.isArray(dados)) {
            setEquipamentos(dados);
          }
        }
      } catch (e) {
        console.error('Erro ao carregar equipamentos no Dashboard:', e);
      }
    };

    carregarDados();
    window.addEventListener('storage', carregarDados);
    return () => window.removeEventListener('storage', carregarDados);
  }, []);

  // LISTA DE SETORES ÚNICOS PARA O SELECT
  const listaSetores = Array.from(
    new Set(equipamentos.map((e) => e.setorUsuario?.trim()).filter(Boolean))
  ).sort();

  // MÉTRICAS GERAIS (INDEPENDENTES DOS FILTROS)
  const totalAtivos = equipamentos.length;

  const valorTotalPatrimonio = equipamentos.reduce((acc, item) => {
    const v = typeof item.valor === 'number' ? item.valor : parseFloat(String(item.valor || 0));
    return acc + (isNaN(v) ? 0 : v);
  }, 0);

  const comAtribuicao = equipamentos.filter(
    (item) => item.usuario && item.usuario.trim() !== '' && item.usuario !== '—'
  ).length;

  const semAtribuicao = totalAtivos - comAtribuicao;

  // DISTRIBUIÇÃO POR SETOR
  const setoresMap: { [key: string]: number } = {};
  equipamentos.forEach((item) => {
    const setor = item.setorUsuario && item.setorUsuario.trim() !== '' ? item.setorUsuario.trim() : 'Não Informado';
    setoresMap[setor] = (setoresMap[setor] || 0) + 1;
  });

  const setoresOrdenados = Object.entries(setoresMap)
    .map(([nome, quantidade]) => ({
      nome,
      quantidade,
      porcentagem: totalAtivos > 0 ? Math.round((quantidade / totalAtivos) * 100) : 0,
    }))
    .sort((a, b) => b.quantidade - a.quantidade);

  // APLICAÇÃO DOS FILTROS NA TABELA DO DASHBOARD
  const equipamentosFiltrados = equipamentos.filter((item) => {
    const termo = buscaTexto.toLowerCase().trim();
    const nome = String(item.nome || '').toLowerCase();
    const patrimonio = String(item.patrimonio || '').toLowerCase();
    const usuario = String(item.usuario || '').toLowerCase();
    const setor = String(item.setorUsuario || '').toLowerCase();

    // Filtro de Texto
    const bateuTexto =
      !termo ||
      nome.includes(termo) ||
      patrimonio.includes(termo) ||
      usuario.includes(termo) ||
      setor.includes(termo);

    // Filtro por Setor
    const bateuSetor =
      setorFiltro === 'TODOS' ||
      (item.setorUsuario || '').trim().toLowerCase() === setorFiltro.toLowerCase();

    // Filtro por Atribuição
    const temUsuario = Boolean(item.usuario && item.usuario.trim() !== '' && item.usuario !== '—');
    const bateuAtribuicao =
      atribuicaoFiltro === 'TODOS' ||
      (atribuicaoFiltro === 'EM_USO' && temUsuario) ||
      (atribuicaoFiltro === 'SEM_USO' && !temUsuario);

    return bateuTexto && bateuSetor && bateuAtribuicao;
  });

  const limparFiltros = () => {
    setBuscaTexto('');
    setSetorFiltro('TODOS');
    setAtribuicaoFiltro('TODOS');
  };

  const temFiltroAtivo = buscaTexto !== '' || setorFiltro !== 'TODOS' || atribuicaoFiltro !== 'TODOS';

  return (
    <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      
      {/* HEADER DA PÁGINA */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '6px' }}>
          Dashboard Geral
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '400' }}>
          Visão geral dos ativos de TI cadastrados, distribuição por setor e filtros de consulta rápida.
        </p>
      </div>

      {/* CARDS DE MÉTRICAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}>
        
        <div
          onClick={limparFiltros}
          style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)', cursor: 'pointer' }}
          title="Clique para ver todos"
        >
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            TOTAL DE ATIVOS
          </span>
          <p style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: '12px 0 0 0' }}>
            {totalAtivos}
          </p>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            VALOR EM PATRIMÔNIO
          </span>
          <p style={{ fontSize: '32px', fontWeight: '800', color: '#2563eb', margin: '12px 0 0 0' }}>
            {valorTotalPatrimonio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>

        <div
          onClick={() => setAtribuicaoFiltro('EM_USO')}
          style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)', cursor: 'pointer' }}
          title="Clique para filtrar apenas os equipamentos Em Uso"
        >
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ATRIBUIÇÃO (EM USO)
          </span>
          <p style={{ fontSize: '32px', fontWeight: '800', color: '#10b981', margin: '12px 0 0 0' }}>
            {comAtribuicao}
          </p>
        </div>

        <div
          onClick={() => setAtribuicaoFiltro('SEM_USO')}
          style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)', cursor: 'pointer' }}
          title="Clique para filtrar apenas os Sem Uso"
        >
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            SEM ATRIBUIÇÃO (DISPONÍVEIS)
          </span>
          <p style={{ fontSize: '32px', fontWeight: '800', color: '#f59e0b', margin: '12px 0 0 0' }}>
            {semAtribuicao}
          </p>
        </div>

      </div>

      {/* SEÇÃO INFERIOR */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '24px' }}>
        
        {/* EQUIPAMENTOS POR SETOR */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>
            Equipamentos por Setor
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '520px', overflowY: 'auto', paddingRight: '6px' }}>
            {setoresOrdenados.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>Nenhum setor registrado.</p>
            ) : (
              setoresOrdenados.map((item) => (
                <div
                  key={item.nome}
                  onClick={() => setSetorFiltro(item.nome)}
                  style={{ cursor: 'pointer' }}
                  title={`Clique para filtrar pelo setor ${item.nome}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    <span style={{ color: setorFiltro === item.nome ? '#2563eb' : '#334155', fontWeight: setorFiltro === item.nome ? '800' : '600' }}>
                      {item.nome}
                    </span>
                    <span style={{ color: '#64748b', fontWeight: '500' }}>
                      {item.quantidade} item(ns) ({item.porcentagem}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${item.porcentagem}%`,
                        height: '100%',
                        background: setorFiltro === item.nome ? '#1d4ed8' : '#2563eb',
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PAINEL DE CONSULTA E LISTA FILTRADA */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
              Consulta de Equipamentos
            </h2>
            <span style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
              Exibindo: {equipamentosFiltrados.length}
            </span>
          </div>

          {/* BARRA DE FILTROS RÁPIDOS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            
            {/* Campo de Busca por Texto */}
            <input
              type="text"
              placeholder="🔍 Buscar NOT, MT, Nome..."
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
            />

            {/* Select por Setor */}
            <select
              value={setorFiltro}
              onChange={(e) => setSetorFiltro(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
            >
              <option value="TODOS">🏢 Todos os Setores</option>
              {listaSetores.map((setor) => (
                <option key={setor} value={setor}>{setor}</option>
              ))}
            </select>

            {/* Select por Atribuição / Status */}
            <select
              value={atribuicaoFiltro}
              onChange={(e) => setAtribuicaoFiltro(e.target.value as any)}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
            >
              <option value="TODOS">👤 Todos os Status</option>
              <option value="EM_USO">🟢 Em Uso (Com Responsável)</option>
              <option value="SEM_USO">🟡 Sem Uso (Disponíveis)</option>
            </select>

          </div>

          {/* BOTÃO PARA LIMPAR FILTROS SE HOUVER ALGUM FILTRO ATIVO */}
          {temFiltroAtivo && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button
                onClick={limparFiltros}
                style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
              >
                ✕ Limpar Filtros
              </button>
            </div>
          )}

          {/* TABELA DE RESULTADOS */}
          <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 1 }}>
                  <th style={{ padding: '10px 12px', fontSize: '10px', color: '#64748b', fontWeight: '800', letterSpacing: '0.05em' }}>PATRIMÔNIO</th>
                  <th style={{ padding: '10px 12px', fontSize: '10px', color: '#64748b', fontWeight: '800', letterSpacing: '0.05em' }}>EQUIPAMENTO</th>
                  <th style={{ padding: '10px 12px', fontSize: '10px', color: '#64748b', fontWeight: '800', letterSpacing: '0.05em' }}>RESPONSÁVEL / SETOR</th>
                  <th style={{ padding: '10px 12px', fontSize: '10px', color: '#64748b', fontWeight: '800', letterSpacing: '0.05em', textAlign: 'right' }}>VALOR</th>
                </tr>
              </thead>
              <tbody>
                {equipamentosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      Nenhum equipamento encontrado com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  equipamentosFiltrados.map((item, idx) => {
                    const valorNum = typeof item.valor === 'number' ? item.valor : parseFloat(String(item.valor || 0));
                    const temUsuario = Boolean(item.usuario && item.usuario.trim() !== '' && item.usuario !== '—');

                    return (
                      <tr key={item.id || idx}>
                        <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', fontWeight: '700', color: '#2563eb' }}>
                          {item.patrimonio || '—'}
                        </td>

                        <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#0f172a', fontWeight: '600' }}>
                          {item.nome || '—'}
                        </td>

                        <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: temUsuario ? '#334155' : '#94a3b8' }}>
                            {temUsuario ? item.usuario : 'Sem Atribuição'}
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                            {item.setorUsuario || 'Geral'}
                          </div>
                        </td>

                        <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', fontWeight: '600', color: '#0f172a', textAlign: 'right' }}>
                          {(isNaN(valorNum) ? 0 : valorNum).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;