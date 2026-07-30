import Card from "../components/Card";

function Dashboard() {
  const equipamentosRecentes = [
    { id: 1, nome: "Notebook Dell Latitude 3420", patrimonio: "PAT-00125", status: "Em Uso", responsavel: "Ana Silva" },
    { id: 2, nome: 'Monitor ThinkVision 23.8"', patrimonio: "PAT-00124", status: "Disponível", responsavel: "-" },
    { id: 3, nome: "MacBook Air M2", patrimonio: "PAT-00123", status: "Em Uso", responsavel: "Carlos Oliveira" },
    { id: 4, nome: "Impressora HP LaserJet", patrimonio: "PAT-00122", status: "Em Manutenção", responsavel: "Suporte TI" },
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      <p className="subtitulo">Bem-vindo ao AssetControl.</p>

      {/* Cards */}
      <div className="cards-grid">
        <Card titulo="Total de Equipamentos" valor={125} cor="#6366f1" />
        <Card titulo="Em Uso" valor={98} cor="#22c55e" />
        <Card titulo="Em Manutenção" valor={12} cor="#eab308" />
        <Card titulo="Disponíveis" valor={15} cor="#3b82f6" />
      </div>

      {/* Tabela de Equipamentos Recentes */}
      <section className="tabela-container">
        <h2>Equipamentos Adicionados Recentemente</h2>
        
        <table className="tabela">
          <thead>
            <tr>
              <th>Patrimônio</th>
              <th>Equipamento</th>
              <th>Status</th>
              <th>Responsável</th>
            </tr>
          </thead>
          <tbody>
            {equipamentosRecentes.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.patrimonio}</strong></td>
                <td>{item.nome}</td>
                <td>
                  <span className={`badge ${item.status.toLowerCase().replace(" ", "-")}`}>
                    {item.status}
                  </span>
                </td>
                <td>{item.responsavel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Dashboard;