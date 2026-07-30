import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';

interface Equipamento {
  id: string;
  nome: string;
  patrimonio: string;
  usuario: string;
  setorUsuario: string;
  valor: number;
}

export function Equipamentos() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>(() => {
    try {
      const salvos = localStorage.getItem('equipamentos_db');
      if (salvos) {
        const dados = JSON.parse(salvos);
        return Array.isArray(dados) ? dados : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  const [selecionados, setSelecionados] = useState<string[]>([]);
  
  // ESTADOS DO FORMULÁRIO DE CADASTRO
  const [nome, setNome] = useState('');
  const [patrimonio, setPatrimonio] = useState('');
  const [usuario, setUsuario] = useState('');
  const [setorUsuario, setSetorUsuario] = useState('');
  const [valorInput, setValorInput] = useState('');
  const [busca, setBusca] = useState('');

  // ESTADO DO EQUIPAMENTO EM EDIÇÃO (MODAL)
  const [equipamentoEmEdicao, setEquipamentoEmEdicao] = useState<Equipamento | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('equipamentos_db', JSON.stringify(equipamentos));
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
    }
  }, [equipamentos]);

  const handleAdicionar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !patrimonio.trim()) {
      alert('Por favor, preencha o Nome e o Patrimônio.');
      return;
    }

    const novo: Equipamento = {
      id: String(Date.now()),
      nome: nome.trim(),
      patrimonio: patrimonio.trim(),
      usuario: usuario.trim(),
      setorUsuario: setorUsuario.trim(),
      valor: parseFloat(valorInput.replace(',', '.')) || 0,
    };

    setEquipamentos((prev) => [novo, ...prev]);
    setNome('');
    setPatrimonio('');
    setUsuario('');
    setSetorUsuario('');
    setValorInput('');
  };

  // SALVAR ALTERAÇÕES DA EDIÇÃO
  const handleSalvarEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipamentoEmEdicao) return;

    if (!equipamentoEmEdicao.nome.trim() || !equipamentoEmEdicao.patrimonio.trim()) {
      alert('Nome e Patrimônio são obrigatórios.');
      return;
    }

    setEquipamentos((prev) =>
      prev.map((item) => (item.id === equipamentoEmEdicao.id ? equipamentoEmEdicao : item))
    );

    setEquipamentoEmEdicao(null); // Fecha o modal
  };

  const handleExcluirUnico = (id: string) => {
    if (confirm('Deseja realmente remover este equipamento?')) {
      setEquipamentos((prev) => prev.filter((e) => e.id !== id));
      setSelecionados((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleExcluirSelecionados = () => {
    if (selecionados.length === 0) return;
    if (confirm(`Tem certeza que deseja excluir os ${selecionados.length} itens selecionados?`)) {
      setEquipamentos((prev) => prev.filter((e) => !selecionados.includes(e.id)));
      setSelecionados([]);
    }
  };

  const handleExcluirTodos = () => {
    if (equipamentos.length === 0) return;
    if (confirm('⚠️ ATENÇÃO: Deseja apagar TODOS os equipamentos cadastrados no sistema?')) {
      setEquipamentos([]);
      setSelecionados([]);
    }
  };

  const handleExportarExcel = () => {
    if (equipamentos.length === 0) {
      alert('Não há dados para exportar!');
      return;
    }

    const dadosExcel = equipamentos.map((item) => ({
      'SETOR': item?.setorUsuario || '',
      'RESPONSAVEL': item?.usuario || '',
      'EQUIPAMENTO': item?.nome || '',
      'PATRIMÔNIO': item?.patrimonio || '',
      'VALOR': item?.valor || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dadosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Equipamentos');
    XLSX.writeFile(workbook, `Ativos_TI_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleImportarExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        const rawData = XLSX.utils.sheet_to_json<any>(ws);

        if (rawData.length === 0) {
          alert('A planilha importada está vazia.');
          return;
        }

        const novosEquipamentos: Equipamento[] = rawData.map((row, index) => {
          const getVal = (nomesPossiveis: string[]) => {
            const keys = Object.keys(row);
            for (const key of keys) {
              const keyNormalizada = key
                .trim()
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
              
              if (nomesPossiveis.some(n => keyNormalizada.includes(n))) {
                return row[key];
              }
            }
            return null;
          };

          const setorVal = getVal(['setor']);
          const respVal = getVal(['responsavel', 'usuario', 'nome']);
          const equipVal = getVal(['equipamento', 'modelo', 'item']);
          const marcaVal = getVal(['marca']);
          const patrimVal = getVal(['patrimonio', 'etiqueta', 'tag']);
          const valorVal = getVal(['valor', 'preco']);

          let nomeCompleto = String(equipVal || '').trim();
          if (marcaVal && String(marcaVal).trim()) {
            nomeCompleto = `${nomeCompleto} (${String(marcaVal).trim()})`;
          }
          if (!nomeCompleto) nomeCompleto = 'Equipamento TI';

          let valorNum = 0;
          if (typeof valorVal === 'number') {
            valorNum = valorVal;
          } else if (valorVal) {
            const limpo = String(valorVal)
              .replace('R$', '')
              .replace(/\s/g, '')
              .replace(/\./g, '')
              .replace(',', '.');
            valorNum = parseFloat(limpo) || 0;
          }

          return {
            id: String(Date.now() + index + Math.random()),
            patrimonio: String(patrimVal || `PAT-${index + 1}`).trim(),
            nome: nomeCompleto,
            usuario: String(respVal || '').trim(),
            setorUsuario: String(setorVal || '').trim(),
            valor: valorNum,
          };
        });

        setEquipamentos((prev) => [...novosEquipamentos, ...prev]);
        alert(`🎉 Sucesso! ${novosEquipamentos.length} itens importados perfeitamente.`);
      } catch (err) {
        console.error(err);
        alert('Erro ao importar. Verifique o arquivo Excel.');
      }
    };

    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const equipamentosFiltrados = equipamentos.filter((item) => {
    const termo = busca.toLowerCase();
    const nomeItem = String(item?.nome || '').toLowerCase();
    const patrimonioItem = String(item?.patrimonio || '').toLowerCase();
    const usuarioItem = String(item?.usuario || '').toLowerCase();
    const setorItem = String(item?.setorUsuario || '').toLowerCase();

    return (
      nomeItem.includes(termo) ||
      patrimonioItem.includes(termo) ||
      usuarioItem.includes(termo) ||
      setorItem.includes(termo)
    );
  });

  const todosSelecionados = equipamentosFiltrados.length > 0 && selecionados.length === equipamentosFiltrados.length;

  const handleToggleSelecionarTodos = () => {
    if (todosSelecionados) {
      setSelecionados([]);
    } else {
      setSelecionados(equipamentosFiltrados.map((item) => item.id));
    }
  };

  const handleToggleItem = (id: string) => {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      
      {/* HEADER DA PÁGINA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '6px' }}>
            Gerenciamento de Equipamentos
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '400' }}>
            Controle de inventário, atribuição de ativos e histórico de patrimônios de TI.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            ref={fileInputRef}
            onChange={handleImportarExcel}
            style={{ display: 'none' }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '10px 18px',
              background: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <span style={{ fontSize: '16px' }}>📥</span> Importar Excel
          </button>

          <button
            onClick={handleExportarExcel}
            style={{
              padding: '10px 18px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
            }}
          >
            <span style={{ fontSize: '16px' }}>📊</span> Exportar Excel
          </button>
        </div>
      </div>

      {/* FORMULÁRIO DE CADASTRO */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)', padding: '28px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <div style={{ width: '4px', height: '22px', background: '#2563eb', borderRadius: '4px' }}></div>
          <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>
            Cadastrar Novo Equipamento
          </h2>
        </div>

        <form onSubmit={handleAdicionar}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Equipamento / Modelo *
              </label>
              <input
                type="text"
                placeholder="Ex: NOT, MT, All in One"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Patrimônio / Etiqueta *
              </label>
              <input
                type="text"
                placeholder="Ex: M&S-18664"
                value={patrimonio}
                onChange={(e) => setPatrimonio(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Usuário Responsável
              </label>
              <input
                type="text"
                placeholder="Ex: Lili Pires"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Setor / Departamento
              </label>
              <input
                type="text"
                placeholder="Ex: Recepção, TI"
                value={setorUsuario}
                onChange={(e) => setSetorUsuario(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Valor de Aquisição (R$)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="280,00"
                value={valorInput}
                onChange={(e) => setValorInput(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="submit"
                style={{
                  width: '100%',
                  height: '44px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                }}
              >
                + Cadastrar Item
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* TABELA DE EQUIPAMENTOS */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>
              Equipamentos Cadastrados
            </h2>
            <span style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
              {equipamentosFiltrados.length}
            </span>

            {selecionados.length > 0 && (
              <button
                onClick={handleExcluirSelecionados}
                style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.25)' }}
              >
                🗑️ Excluir Selecionados ({selecionados.length})
              </button>
            )}

            {equipamentos.length > 0 && (
              <button
                onClick={handleExcluirTodos}
                style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
              >
                ⚠️ Excluir Tudo
              </button>
            )}
          </div>

          <div style={{ width: '320px' }}>
            <input
              type="text"
              placeholder="🔍 Buscar por patrimônio, item ou pessoa..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{ width: '100%', padding: '10px 16px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
            />
          </div>

        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '14px 16px', width: '40px', borderBottom: '2px solid #e2e8f0', borderTopLeftRadius: '10px' }}>
                  <input
                    type="checkbox"
                    checked={todosSelecionados}
                    onChange={handleToggleSelecionarTodos}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#2563eb' }}
                  />
                </th>
                <th style={{ padding: '14px 16px', fontSize: '11px', color: '#64748b', fontWeight: '800', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0' }}>PATRIMÔNIO</th>
                <th style={{ padding: '14px 16px', fontSize: '11px', color: '#64748b', fontWeight: '800', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0' }}>EQUIPAMENTO / MODELO</th>
                <th style={{ padding: '14px 16px', fontSize: '11px', color: '#64748b', fontWeight: '800', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0' }}>RESPONSÁVEL</th>
                <th style={{ padding: '14px 16px', fontSize: '11px', color: '#64748b', fontWeight: '800', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0' }}>SETOR</th>
                <th style={{ padding: '14px 16px', fontSize: '11px', color: '#64748b', fontWeight: '800', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0' }}>VALOR</th>
                <th style={{ padding: '14px 16px', fontSize: '11px', color: '#64748b', fontWeight: '800', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0', textAlign: 'right', borderTopRightRadius: '10px' }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {equipamentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                    Nenhum equipamento cadastrado ou encontrado.
                  </td>
                </tr>
              ) : (
                equipamentosFiltrados.map((item, index) => {
                  const idItem = item?.id || String(index);
                  const isChecked = selecionados.includes(idItem);
                  const valorNum = typeof item?.valor === 'number' ? item.valor : parseFloat(String(item?.valor || 0));

                  return (
                    <tr
                      key={idItem}
                      style={{
                        background: isChecked ? '#f0f9ff' : 'transparent',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleItem(idItem)}
                          style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#2563eb' }}
                        />
                      </td>

                      <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', fontWeight: '700', color: '#2563eb' }}>
                        {item?.patrimonio || '—'}
                      </td>

                      <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                        {item?.nome || '—'}
                      </td>

                      <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: item?.usuario ? '#334155' : '#94a3b8', fontWeight: item?.usuario ? '600' : '400' }}>
                        {item?.usuario ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                            {item.usuario}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                          {item?.setorUsuario || 'Geral'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                        {(isNaN(valorNum) ? 0 : valorNum).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>

                      <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {/* BOTÃO EDITAR */}
                          <button
                            onClick={() => setEquipamentoEmEdicao(item)}
                            style={{ background: '#f1f5f9', color: '#2563eb', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                          >
                            ✏️ Editar
                          </button>

                          {/* BOTÃO EXCLUIR */}
                          <button
                            onClick={() => handleExcluirUnico(idItem)}
                            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE EDIÇÃO */}
      {equipamentoEmEdicao && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '540px',
            padding: '28px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                ✏️ Editar Equipamento
              </h2>
              <button
                onClick={() => setEquipamentoEmEdicao(null)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarEdicao}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Patrimônio / Etiqueta *
                  </label>
                  <input
                    type="text"
                    value={equipamentoEmEdicao.patrimonio}
                    onChange={(e) => setEquipamentoEmEdicao({ ...equipamentoEmEdicao, patrimonio: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Equipamento / Modelo *
                  </label>
                  <input
                    type="text"
                    value={equipamentoEmEdicao.nome}
                    onChange={(e) => setEquipamentoEmEdicao({ ...equipamentoEmEdicao, nome: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Usuário Responsável
                  </label>
                  <input
                    type="text"
                    value={equipamentoEmEdicao.usuario}
                    onChange={(e) => setEquipamentoEmEdicao({ ...equipamentoEmEdicao, usuario: e.target.value })}
                    placeholder="Deixe em branco para 'Sem uso'"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Setor
                  </label>
                  <input
                    type="text"
                    value={equipamentoEmEdicao.setorUsuario}
                    onChange={(e) => setEquipamentoEmEdicao({ ...equipamentoEmEdicao, setorUsuario: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={equipamentoEmEdicao.valor}
                    onChange={(e) => setEquipamentoEmEdicao({ ...equipamentoEmEdicao, valor: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setEquipamentoEmEdicao(null)}
                    style={{ padding: '10px 18px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    style={{ padding: '10px 18px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
                  >
                    Salvar Alterações
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Equipamentos;