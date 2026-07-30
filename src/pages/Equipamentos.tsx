import { useState, useEffect } from "react";

interface Equipamento {
  id: number;
  nome: string;
  patrimonio: string;
  status: string;
  responsavel: string;
}

function Equipamentos() {
  // 1. Carrega os dados do localStorage (se existirem) ou usa uma lista inicial
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>(() => {
    const dadosSalvos = localStorage.getItem("assetcontrol_equipamentos");
    if (dadosSalvos) {
      return JSON.parse(dadosSalvos);
    }
    return [
      { id: 1, nome: "Notebook Dell Latitude 3420", patrimonio: "PAT-00125", status: "Em Uso", responsavel: "Ana Silva" },
      { id: 2, nome: 'Monitor ThinkVision 23.8"', patrimonio: "PAT-00124", status: "Disponível", responsavel: "-" },
    ];
  });

  // Estados dos campos do formulário
  const [nome, setNome] = useState("");
  const [patrimonio, setPatrimonio] = useState("");
  const [status, setStatus] = useState("Disponível");
  const [responsavel, setResponsavel] = useState("");

  // 2. Sempre que a lista de equipamentos mudar, salva no localStorage automaticamente
  useEffect(() => {
    localStorage.setItem("assetcontrol_equipamentos", JSON.stringify(equipamentos));
  }, [equipamentos]);

  // Cadastrar novo equipamento
  const handleAdicionar = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !patrimonio) {
      alert("Por favor, preencha pelo menos o nome e o patrimônio!");
      return;
    }

    const novoEquipamento: Equipamento = {
      id: Date.now(),
      nome,
      patrimonio,
      status,
      responsavel: responsavel || "-",
    };

    setEquipamentos([novoEquipamento, ...equipamentos]);

    // Limpa o formulário
    setNome("");
    setPatrimonio("");
    setStatus("Disponível");
    setResponsavel("");
  };

  // 3. Função para Excluir um Equipamento
  const handleExcluir = (id: number) => {
    if (confirm("Tem certeza que deseja remover este equipamento?")) {
      const listaFiltrada = equipamentos.filter((item) => item.id !== id);
      setEquipamentos(listaFiltrada);
    }
  };

  return (
    <div className="equipamentos-container">
      <h1>Gerenciamento de Equipamentos</h1>
      <p className="subtitulo">Cadastre e visualize o patrimônio de TI.</p>

      {/* Form Cadastro */}
      <form onSubmit={handleAdicionar} className="form-cadastro">
        <h2>Cadastrar Novo Equipamento</h2>
        
        <div className="form-grid">
          <div className="input-group">
            <label>Nome do Equipamento</label>
            <input 
              type="text" 
              placeholder="Ex: Notebook Dell Vostro" 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Patrimônio / Tag</label>
            <input 
              type="text" 
              placeholder="Ex: PAT-00126" 
              value={patrimonio}
              onChange={(e) => setPatrimonio(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Disponível">Disponível</option>
              <option value="Em Uso">Em Uso</option>
              <option value="Em Manutenção">Em Manutenção</option>
            </select>
          </div>

          <div className="input-group">
            <label>Responsável</label>
            <input 
              type="text" 
              placeholder="Ex: João Souza (opcional)" 
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn-salvar">
          ➕ Cadastrar Equipamento
        </button>
      </form>

      {/* Tabela de Equipamentos */}
      <section className="tabela-container">
        <h2>Todos os Equipamentos ({equipamentos.length})</h2>
        <table className="tabela">
          <thead>
            <tr>
              <th>Patrimônio</th>
              <th>Equipamento</th>
              <th>Status</th>
              <th>Responsável</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {equipamentos.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.patrimonio}</strong></td>
                <td>{item.nome}</td>
                <td>
                  <span className={`badge ${item.status.toLowerCase().replace(" ", "-")}`}>
                    {item.status}
                  </span>
                </td>
                <td>{item.responsavel}</td>
                <td>
                  <button 
                    onClick={() => handleExcluir(item.id)} 
                    className="btn-excluir"
                    title="Excluir equipamento"
                  >
                    🗑️ Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Equipamentos;