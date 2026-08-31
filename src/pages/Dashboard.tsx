import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

type Filtro = "todos" | "equipamentos" | "impressoras";

interface Equipamento {
  id: number;
  nome?: string;
  categoria?: string;
  patrimonio?: string;
  status?: string;
  localizacao?: string;
  setor_usuario?: string;
}

interface Impressora {
  id: number;
  patrimonio?: string;
  ip?: string;
  local?: string;
  tipo?: string;
  marca?: string;
  modelo?: string;
  situacao?: string;
}

export function Dashboard() {
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [impressoras, setImpressoras] = useState<Impressora[]>([]);

  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);

    try {
      const [resEquipamentos, resImpressoras] =
        await Promise.all([
          api.get("/equipamentos"),
          api.get("/impressoras"),
        ]);

      setEquipamentos(
        Array.isArray(resEquipamentos.data)
          ? resEquipamentos.data
          : []
      );

      setImpressoras(
        Array.isArray(resImpressoras.data)
          ? resImpressoras.data
          : []
      );
    } catch (erro) {
      console.error("Erro ao carregar dados do dashboard:", erro);
    } finally {
      setCarregando(false);
    }
  }

  const mostrarEquipamentos =
    filtro === "todos" || filtro === "equipamentos";

  const mostrarImpressoras =
    filtro === "todos" || filtro === "impressoras";

  const totalEquipamentos =
    mostrarEquipamentos ? equipamentos.length : 0;

  const totalImpressoras =
    mostrarImpressoras ? impressoras.length : 0;

  const totalAtivos =
    totalEquipamentos + totalImpressoras;

  const equipamentosFuncionando = equipamentos.filter(
    (item) =>
      normalizar(item.status) === "funcionando" ||
      normalizar(item.status) === "ativo"
  ).length;

  const equipamentosManutencao = equipamentos.filter(
    (item) =>
      normalizar(item.status).includes("manuten")
  ).length;

  const equipamentosParados = equipamentos.filter(
    (item) => {
      const status = normalizar(item.status);

      return (
        status.includes("parad") ||
        status.includes("inativ") ||
        status.includes("baixad")
      );
    }
  ).length;

  const impressorasFuncionando = impressoras.filter(
    (item) =>
      normalizar(item.situacao) === "funcionando"
  ).length;

  const impressorasManutencao = impressoras.filter(
    (item) =>
      normalizar(item.situacao).includes("manuten")
  ).length;

  const impressorasParadas = impressoras.filter(
    (item) => {
      const situacao = normalizar(item.situacao);

      return (
        situacao.includes("parad") ||
        situacao.includes("inativ")
      );
    }
  ).length;

  const totalFuncionando =
    (mostrarEquipamentos
      ? equipamentosFuncionando
      : 0) +
    (mostrarImpressoras
      ? impressorasFuncionando
      : 0);

  const totalManutencao =
    (mostrarEquipamentos
      ? equipamentosManutencao
      : 0) +
    (mostrarImpressoras
      ? impressorasManutencao
      : 0);

  const totalParados =
    (mostrarEquipamentos
      ? equipamentosParados
      : 0) +
    (mostrarImpressoras
      ? impressorasParadas
      : 0);

  const locais = useMemo(() => {
    const mapa = new Map<string, number>();

    if (mostrarEquipamentos) {
      equipamentos.forEach((item) => {
        const local =
          item.localizacao?.trim() || "Não informado";

        mapa.set(local, (mapa.get(local) || 0) + 1);
      });
    }

    if (mostrarImpressoras) {
      impressoras.forEach((item) => {
        const local =
          item.local?.trim() || "Não informado";

        mapa.set(local, (mapa.get(local) || 0) + 1);
      });
    }

    return Array.from(mapa.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [
    equipamentos,
    impressoras,
    mostrarEquipamentos,
    mostrarImpressoras,
  ]);

  const marcas = useMemo(() => {
    const mapa = new Map<string, number>();

    if (mostrarImpressoras) {
      impressoras.forEach((item) => {
        const marca =
          item.marca?.trim() || "Não informado";

        mapa.set(
          marca,
          (mapa.get(marca) || 0) + 1
        );
      });
    }

    return Array.from(mapa.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [impressoras, mostrarImpressoras]);

  if (carregando) {
    return (
      <div
        style={{
          width: "100%",
          minHeight: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748b",
          fontSize: "14px",
        }}
      >
        Carregando dashboard...
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        padding: "0 12px 30px",
        boxSizing: "border-box",
        fontFamily:
          "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* CABEÇALHO */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "28px",
        }}
      >
        <div>
          <h1
            style={{
              margin: "0 0 6px",
              fontSize: "28px",
              fontWeight: "800",
              color: "#0f172a",
            }}
          >
            Dashboard
          </h1>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Visão geral dos ativos de TI do hospital.
          </p>
        </div>

        <button
          onClick={carregarDados}
          style={{
            padding: "10px 16px",
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
            background: "#ffffff",
            color: "#334155",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          🔄 Atualizar
        </button>
      </div>

      {/* FILTRO */}

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "8px",
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "24px",
          boxShadow:
            "0 4px 20px -2px rgba(0,0,0,0.04)",
        }}
      >
        <BotaoFiltro
          ativo={filtro === "todos"}
          onClick={() => setFiltro("todos")}
        >
          📊 Todos
        </BotaoFiltro>

        <BotaoFiltro
          ativo={filtro === "equipamentos"}
          onClick={() => setFiltro("equipamentos")}
        >
          🖥️ Equipamentos
        </BotaoFiltro>

        <BotaoFiltro
          ativo={filtro === "impressoras"}
          onClick={() => setFiltro("impressoras")}
        >
          🖨️ Impressoras
        </BotaoFiltro>
      </div>

      {/* CARDS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {mostrarEquipamentos && (
          <Card
            titulo="Equipamentos"
            valor={totalEquipamentos}
            icone="🖥️"
          />
        )}

        {mostrarImpressoras && (
          <Card
            titulo="Impressoras"
            valor={totalImpressoras}
            icone="🖨️"
          />
        )}

        <Card
          titulo="Total de Ativos"
          valor={totalAtivos}
          icone="📦"
        />

        <Card
          titulo="Funcionando"
          valor={totalFuncionando}
          icone="🟢"
        />

        <Card
          titulo="Em Manutenção"
          valor={totalManutencao}
          icone="🟠"
        />

        <Card
          titulo="Parados / Inativos"
          valor={totalParados}
          icone="🔴"
        />
      </div>

      {/* GRÁFICOS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
        }}
      >
        {/* SITUAÇÃO */}

        <Painel titulo="Situação dos Ativos">
          <Barra
            titulo="Funcionando"
            valor={totalFuncionando}
            total={totalAtivos}
          />

          <Barra
            titulo="Em manutenção"
            valor={totalManutencao}
            total={totalAtivos}
          />

          <Barra
            titulo="Parados / Inativos"
            valor={totalParados}
            total={totalAtivos}
          />

          {totalAtivos === 0 && (
            <MensagemVazia />
          )}
        </Painel>

        {/* LOCAIS */}

        <Painel titulo="Ativos por Local">
          {locais.length === 0 ? (
            <MensagemVazia />
          ) : (
            locais.map(([local, quantidade]) => (
              <Barra
                key={local}
                titulo={local}
                valor={quantidade}
                total={Math.max(
                  ...locais.map(
                    ([, quantidade]) => quantidade
                  )
                )}
              />
            ))
          )}
        </Painel>

        {/* MARCAS */}

        {mostrarImpressoras && (
          <Painel titulo="Impressoras por Marca">
            {marcas.length === 0 ? (
              <MensagemVazia />
            ) : (
              marcas.map(
                ([marca, quantidade]) => (
                  <Barra
                    key={marca}
                    titulo={marca}
                    valor={quantidade}
                    total={Math.max(
                      ...marcas.map(
                        ([, quantidade]) =>
                          quantidade
                      )
                    )}
                  />
                )
              )
            )}
          </Painel>
        )}
      </div>

      {/* RESUMO */}

      <div
        style={{
          marginTop: "20px",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "22px",
        }}
      >
        <h2
          style={{
            margin: "0 0 16px",
            fontSize: "16px",
            fontWeight: "800",
            color: "#0f172a",
          }}
        >
          Resumo
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
          }}
        >
          {mostrarEquipamentos && (
            <ResumoItem
              titulo="Equipamentos cadastrados"
              valor={equipamentos.length}
            />
          )}

          {mostrarImpressoras && (
            <ResumoItem
              titulo="Impressoras cadastradas"
              valor={impressoras.length}
            />
          )}

          <ResumoItem
            titulo="Total de ativos"
            valor={totalAtivos}
          />
        </div>
      </div>
    </div>
  );
}

/* ==========================================================
   COMPONENTES
========================================================== */

function BotaoFiltro({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 18px",
        border: ativo
          ? "1px solid #2563eb"
          : "1px solid #e2e8f0",
        borderRadius: "9px",
        background: ativo ? "#eff6ff" : "#ffffff",
        color: ativo ? "#2563eb" : "#475569",
        fontWeight: "700",
        cursor: "pointer",
        fontSize: "13px",
      }}
    >
      {children}
    </button>
  );
}

function Card({
  titulo,
  valor,
  icone,
}: {
  titulo: string;
  valor: number;
  icone: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "20px",
        boxShadow:
          "0 4px 20px -2px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            color: "#64748b",
            fontWeight: "700",
          }}
        >
          {titulo}
        </span>

        <span style={{ fontSize: "22px" }}>
          {icone}
        </span>
      </div>

      <strong
        style={{
          fontSize: "30px",
          color: "#0f172a",
        }}
      >
        {valor}
      </strong>
    </div>
  );
}

function Painel({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "22px",
        minWidth: 0,
        boxShadow:
          "0 4px 20px -2px rgba(0,0,0,0.04)",
      }}
    >
      <h2
        style={{
          margin: "0 0 22px",
          fontSize: "16px",
          fontWeight: "800",
          color: "#0f172a",
        }}
      >
        {titulo}
      </h2>

      {children}
    </div>
  );
}

function Barra({
  titulo,
  valor,
  total,
}: {
  titulo: string;
  valor: number;
  total: number;
}) {
  const percentual =
    total > 0
      ? Math.min((valor / total) * 100, 100)
      : 0;

  return (
    <div style={{ marginBottom: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "7px",
          fontSize: "12px",
        }}
      >
        <span
          style={{
            color: "#475569",
            fontWeight: "600",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {titulo}
        </span>

        <strong style={{ color: "#0f172a" }}>
          {valor}
        </strong>
      </div>

      <div
        style={{
          height: "8px",
          background: "#e2e8f0",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentual}%`,
            height: "100%",
            background: "#2563eb",
            borderRadius: "10px",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

function ResumoItem({
  titulo,
  valor,
}: {
  titulo: string;
  valor: number;
}) {
  return (
    <div
      style={{
        background: "#f8fafc",
        borderRadius: "10px",
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: "12px",
          marginBottom: "4px",
        }}
      >
        {titulo}
      </div>

      <strong
        style={{
          fontSize: "20px",
          color: "#0f172a",
        }}
      >
        {valor}
      </strong>
    </div>
  );
}

function MensagemVazia() {
  return (
    <div
      style={{
        padding: "30px 10px",
        textAlign: "center",
        color: "#94a3b8",
        fontSize: "13px",
      }}
    >
      Nenhum dado disponível.
    </div>
  );
}

function normalizar(valor?: string) {
  return (valor || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default Dashboard;