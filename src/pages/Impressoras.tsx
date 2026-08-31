import React, { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import api from "../services/api";

export interface Impressora {
  id: number;
  patrimonio: string;
  ip: string;
  local: string;
  tipo: string;
  marca: string;
  modelo: string;
  situacao: string;
  preco: number;
  observacao: string;
  criado_por?: string;
  criado_em?: string;
  atualizado_em?: string;
}

export function Impressoras() {
  const [impressoras, setImpressoras] = useState<Impressora[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [patrimonio, setPatrimonio] = useState("");
  const [ip, setIp] = useState("");
  const [local, setLocal] = useState("");
  const [tipo, setTipo] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [situacao, setSituacao] = useState("Funcionando");
  const [preco, setPreco] = useState("");
  const [observacao, setObservacao] = useState("");

  const [impressoraEmEdicao, setImpressoraEmEdicao] =
    useState<Impressora | null>(null);

  // ==========================================================
  // CARREGAR IMPRESSORAS
  // ==========================================================

  useEffect(() => {
    carregarImpressoras();
  }, []);

  async function carregarImpressoras() {
    setCarregando(true);

    try {
      const resposta = await api.get<Impressora[]>("/impressoras");

      const dados = Array.isArray(resposta.data)
        ? resposta.data
        : [];

      setImpressoras(dados);
      setSelecionados([]);
    } catch (erro) {
      console.error("Erro ao carregar impressoras:", erro);
      setImpressoras([]);
    } finally {
      setCarregando(false);
    }
  }

  // ==========================================================
  // CADASTRAR
  // ==========================================================

  async function handleAdicionar(e: React.FormEvent) {
    e.preventDefault();

    if (!patrimonio.trim() || !modelo.trim()) {
      alert("Preencha o Patrimônio e o Modelo.");
      return;
    }

    const novaImpressora = {
      patrimonio: patrimonio.trim(),
      ip: ip.trim(),
      local: local.trim(),
      tipo: tipo.trim(),
      marca: marca.trim(),
      modelo: modelo.trim(),
      situacao,
      preco: parseFloat(preco.replace(",", ".")) || 0,
      observacao: observacao.trim(),
    };

    try {
      const resposta = await api.post<Impressora>(
        "/impressoras",
        novaImpressora
      );

      setImpressoras((prev) => [
        resposta.data,
        ...prev,
      ]);

      limparFormulario();

      alert("Impressora cadastrada com sucesso!");
    } catch (erro: any) {
      console.error("Erro ao cadastrar:", erro);

      alert(
        erro.response?.data?.erro ||
          "Erro ao cadastrar impressora."
      );
    }
  }

  function limparFormulario() {
    setPatrimonio("");
    setIp("");
    setLocal("");
    setTipo("");
    setMarca("");
    setModelo("");
    setSituacao("Funcionando");
    setPreco("");
    setObservacao("");
  }

  // ==========================================================
  // EDITAR
  // ==========================================================

  async function handleSalvarEdicao(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!impressoraEmEdicao) return;

    if (
      !impressoraEmEdicao.patrimonio.trim() ||
      !impressoraEmEdicao.modelo.trim()
    ) {
      alert("Patrimônio e Modelo são obrigatórios.");
      return;
    }

    try {
      const resposta = await api.put<Impressora>(
        `/impressoras/${impressoraEmEdicao.id}`,
        impressoraEmEdicao
      );

      setImpressoras((prev) =>
        prev.map((item) =>
          item.id === resposta.data.id
            ? resposta.data
            : item
        )
      );

      setImpressoraEmEdicao(null);

      alert("Impressora atualizada com sucesso!");
    } catch (erro: any) {
      console.error("Erro ao editar:", erro);

      alert(
        erro.response?.data?.erro ||
          "Erro ao salvar alterações."
      );
    }
  }

  // ==========================================================
  // EXCLUIR INDIVIDUAL
  // ==========================================================

  async function handleExcluir(id: number) {
    const confirmar = window.confirm(
      "Deseja realmente excluir esta impressora?"
    );

    if (!confirmar) return;

    try {
      await api.delete(`/impressoras/${id}`);

      setImpressoras((prev) =>
        prev.filter((item) => item.id !== id)
      );

      setSelecionados((prev) =>
        prev.filter((item) => item !== id)
      );

      alert("Impressora excluída com sucesso!");
    } catch (erro: any) {
      console.error("Erro ao excluir:", erro);

      alert(
        erro.response?.data?.erro ||
          "Erro ao excluir impressora."
      );
    }
  }

  // ==========================================================
  // FILTRO / BUSCA
  // ==========================================================

  const impressorasFiltradas = impressoras.filter(
    (item) => {
      const termo = busca.toLowerCase();

      return (
        String(item.patrimonio || "")
          .toLowerCase()
          .includes(termo) ||
        String(item.ip || "")
          .toLowerCase()
          .includes(termo) ||
        String(item.local || "")
          .toLowerCase()
          .includes(termo) ||
        String(item.tipo || "")
          .toLowerCase()
          .includes(termo) ||
        String(item.marca || "")
          .toLowerCase()
          .includes(termo) ||
        String(item.modelo || "")
          .toLowerCase()
          .includes(termo) ||
        String(item.situacao || "")
          .toLowerCase()
          .includes(termo) ||
        String(item.observacao || "")
          .toLowerCase()
          .includes(termo)
      );
    }
  );

  const todosSelecionados =
    impressorasFiltradas.length > 0 &&
    impressorasFiltradas.every((item) =>
      selecionados.includes(item.id)
    );

  function handleToggleItem(id: number) {
    setSelecionados((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  }

  function handleToggleSelecionarTodos() {
    if (todosSelecionados) {
      setSelecionados((prev) =>
        prev.filter(
          (id) =>
            !impressorasFiltradas.some(
              (item) => item.id === id
            )
        )
      );
    } else {
      const idsVisiveis = impressorasFiltradas.map(
        (item) => item.id
      );

      setSelecionados((prev) => [
        ...new Set([...prev, ...idsVisiveis]),
      ]);
    }
  }

  // ==========================================================
  // EXCLUIR SELECIONADOS
  // ==========================================================

  async function handleExcluirSelecionados() {
    if (selecionados.length === 0) {
      return;
    }

    const confirmar = window.confirm(
      `Deseja realmente excluir ${selecionados.length} impressora(s) selecionada(s)?`
    );

    if (!confirmar) return;

    try {
      await Promise.all(
        selecionados.map((id) =>
          api.delete(`/impressoras/${id}`)
        )
      );

      setImpressoras((prev) =>
        prev.filter(
          (item) => !selecionados.includes(item.id)
        )
      );

      setSelecionados([]);

      alert(
        "Impressoras selecionadas excluídas com sucesso!"
      );
    } catch (erro) {
      console.error(
        "Erro ao excluir selecionadas:",
        erro
      );

      alert(
        "Ocorreu um erro ao excluir uma ou mais impressoras."
      );

      carregarImpressoras();
    }
  }

  // ==========================================================
  // EXCLUIR TODAS
  // ==========================================================

  async function handleExcluirTodos() {
    if (impressoras.length === 0) return;

    const confirmar = window.confirm(
      `ATENÇÃO!\n\nDeseja realmente excluir TODAS as ${impressoras.length} impressoras cadastradas?\n\nEssa ação não poderá ser desfeita.`
    );

    if (!confirmar) return;

    try {
      await Promise.all(
        impressoras.map((item) =>
          api.delete(`/impressoras/${item.id}`)
        )
      );

      setImpressoras([]);
      setSelecionados([]);

      alert(
        "Todas as impressoras foram excluídas com sucesso!"
      );
    } catch (erro) {
      console.error("Erro ao excluir todas:", erro);

      alert(
        "Ocorreu um erro ao excluir as impressoras."
      );

      carregarImpressoras();
    }
  }

  // ==========================================================
  // EXPORTAR EXCEL
  // ==========================================================

  function handleExportarExcel() {
    if (impressoras.length === 0) {
      alert(
        "Não existem impressoras cadastradas para exportar."
      );

      return;
    }

    const dados = impressoras.map((item) => ({
      PATRIMÔNIO: item.patrimonio || "",
      IP: item.ip || "",
      LOCAL: item.local || "",
      TIPO: item.tipo || "",
      MARCA: item.marca || "",
      MODELO: item.modelo || "",
      SITUAÇÃO: item.situacao || "",
      PREÇO: Number(item.preco || 0),
      OBSERVAÇÃO: item.observacao || "",
    }));

    const worksheet =
      XLSX.utils.json_to_sheet(dados);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Impressoras"
    );

    XLSX.writeFile(
      workbook,
      "impressoras_assetcontrol.xlsx"
    );
  }

  // ==========================================================
  // IMPORTAR EXCEL
  // ==========================================================

  async function handleImportarExcel(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const arquivo = e.target.files?.[0];

    if (!arquivo) return;

    try {
      const dados = await arquivo.arrayBuffer();

      const workbook = XLSX.read(dados, {
        type: "array",
      });

      const primeiraAba =
        workbook.SheetNames[0];

      const worksheet =
        workbook.Sheets[primeiraAba];

      const linhas = XLSX.utils.sheet_to_json<
        Record<string, any>
      >(worksheet, {
        defval: "",
      });

      if (linhas.length === 0) {
        alert(
          "O arquivo não possui registros para importar."
        );

        return;
      }

      let importadas = 0;
      let erros = 0;

      for (const linha of linhas) {
        const patrimonio = String(
          linha["PATRIMÔNIO"] ??
            linha["PATRIMONIO"] ??
            linha["patrimonio"] ??
            ""
        ).trim();

        const ip = String(
          linha["IP"] ??
            linha["ip"] ??
            ""
        ).trim();

        const local = String(
          linha["LOCAL"] ??
            linha["local"] ??
            ""
        ).trim();

        const tipo = String(
          linha["TIPO"] ??
            linha["tipo"] ??
            ""
        ).trim();

        const marca = String(
          linha["MARCA"] ??
            linha["marca"] ??
            ""
        ).trim();

        const modelo = String(
          linha["MODELO"] ??
            linha["modelo"] ??
            ""
        ).trim();

        const situacao =
          String(
            linha["SITUAÇÃO"] ??
              linha["SITUACAO"] ??
              linha["situacao"] ??
              "Funcionando"
          ).trim() || "Funcionando";

        const precoValor =
          linha["PREÇO"] ??
          linha["PRECO"] ??
          linha["preco"] ??
          0;

        const preco =
          typeof precoValor === "number"
            ? precoValor
            : parseFloat(
                String(precoValor)
                  .replace("R$", "")
                  .replace(/\./g, "")
                  .replace(",", ".")
                  .trim()
              ) || 0;

        const observacao = String(
          linha["OBSERVAÇÃO"] ??
            linha["OBSERVACAO"] ??
            linha["observacao"] ??
            ""
        ).trim();

        if (!patrimonio || !modelo) {
          erros++;
          continue;
        }

        try {
          await api.post("/impressoras", {
            patrimonio,
            ip,
            local,
            tipo,
            marca,
            modelo,
            situacao,
            preco,
            observacao,
          });

          importadas++;
        } catch (erro) {
          console.error(
            "Erro ao importar linha:",
            erro
          );

          erros++;
        }
      }

      await carregarImpressoras();

      alert(
        `Importação concluída!\n\n` +
          `Importadas: ${importadas}\n` +
          `Erros/ignoradas: ${erros}`
      );
    } catch (erro) {
      console.error(
        "Erro ao importar Excel:",
        erro
      );

      alert(
        "Não foi possível ler o arquivo Excel."
      );
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  // ==========================================================
  // TELA
  // ==========================================================

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1800px",
        margin: "0 auto",
        fontFamily:
          "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* CABEÇALHO */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
          gap: "20px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "800",
              color: "#0f172a",
              marginBottom: "6px",
            }}
          >
            Gerenciamento de Impressoras
          </h1>

          <p
            style={{
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Controle de inventário, localização e
            acompanhamento das impressoras.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
          }}
        >
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            ref={fileInputRef}
            onChange={handleImportarExcel}
            style={{ display: "none" }}
          />

          <button
            onClick={() =>
              fileInputRef.current?.click()
            }
            style={{
              padding: "10px 18px",
              background: "#ffffff",
              color: "#334155",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow:
                "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <span>📥</span>
            Importar Excel
          </button>

          <button
            onClick={handleExportarExcel}
            style={{
              padding: "10px 18px",
              background:
                "linear-gradient(135deg, #059669 0%, #10b981 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow:
                "0 4px 12px rgba(16, 185, 129, 0.25)",
            }}
          >
            <span>📊</span>
            Exportar Excel
          </button>
        </div>
      </div>

      {/* FORMULÁRIO */}

      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
          padding: "28px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "4px",
              height: "22px",
              background: "#2563eb",
              borderRadius: "4px",
            }}
          />

          <h2
            style={{
              fontSize: "17px",
              fontWeight: "700",
              color: "#0f172a",
            }}
          >
            Cadastrar Nova Impressora
          </h2>
        </div>

        <form onSubmit={handleAdicionar}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
              gap: "20px",
            }}
          >
            <Campo
              label="Patrimônio / Etiqueta *"
              placeholder="Ex: IMP-001"
              value={patrimonio}
              onChange={setPatrimonio}
            />

            <Campo
              label="Endereço IP"
              placeholder="Ex: 192.168.1.100"
              value={ip}
              onChange={setIp}
            />

            <Campo
              label="Local"
              placeholder="Ex: Centro Cirúrgico"
              value={local}
              onChange={setLocal}
            />

            <Campo
              label="Tipo"
              placeholder="Ex: Multifuncional"
              value={tipo}
              onChange={setTipo}
            />

            <Campo
              label="Marca"
              placeholder="Ex: Kyocera"
              value={marca}
              onChange={setMarca}
            />

            <Campo
              label="Modelo *"
              placeholder="Ex: M3655IDN"
              value={modelo}
              onChange={setModelo}
            />

            <div>
              <label style={labelStyle}>
                Situação
              </label>

              <select
                value={situacao}
                onChange={(e) =>
                  setSituacao(e.target.value)
                }
                style={inputStyle}
              >
                <option value="Funcionando">
                  Funcionando
                </option>

                <option value="Em manutenção">
                  Em manutenção
                </option>

                <option value="Parada">
                  Parada
                </option>

                <option value="Inativa">
                  Inativa
                </option>
              </select>
            </div>

            <Campo
              label="Valor / Aluguel (R$)"
              placeholder="Ex: 500,00"
              value={preco}
              onChange={setPreco}
              type="text"
            />

            <Campo
              label="Observação"
              placeholder="Informações adicionais"
              value={observacao}
              onChange={setObservacao}
            />

            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              <button
                type="submit"
                style={{
                  width: "100%",
                  height: "44px",
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                + Cadastrar Impressora
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* LISTAGEM */}

      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          padding: "28px",
          boxShadow:
            "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <h2
              style={{
                fontSize: "17px",
                fontWeight: "700",
                color: "#0f172a",
              }}
            >
              Impressoras Cadastradas
            </h2>

            <span
              style={{
                background: "#eff6ff",
                color: "#2563eb",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "800",
              }}
            >
              {impressorasFiltradas.length}
            </span>

            {selecionados.length > 0 && (
              <button
                onClick={handleExcluirSelecionados}
                style={dangerButtonStyle}
              >
                🗑️ Excluir Selecionados (
                {selecionados.length})
              </button>
            )}

            {impressoras.length > 0 && (
              <button
                onClick={handleExcluirTodos}
                style={dangerLightButtonStyle}
              >
                ⚠️ Excluir Tudo
              </button>
            )}
          </div>

          <div style={{ width: "320px" }}>
            <input
              type="text"
              placeholder="🔎 Buscar por patrimônio, local ou modelo..."
              value={busca}
              onChange={(e) =>
                setBusca(e.target.value)
              }
              style={{
                width: "100%",
                padding: "10px 16px",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                fontSize: "13px",
                outline: "none",
                background: "#f8fafc",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {carregando ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            Carregando impressoras...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: "0",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                  }}
                >
                  <th style={checkboxHeaderStyle}>
                    <input
                      type="checkbox"
                      checked={todosSelecionados}
                      onChange={
                        handleToggleSelecionarTodos
                      }
                      style={{
                        cursor: "pointer",
                        width: "16px",
                        height: "16px",
                        accentColor: "#2563eb",
                      }}
                    />
                  </th>

                  <th style={headerStyle}>
                    PATRIMÔNIO
                  </th>

                  <th style={headerStyle}>
                    IP
                  </th>

                  <th style={headerStyle}>
                    LOCAL
                  </th>

                  <th style={headerStyle}>
                    TIPO
                  </th>

                  <th style={headerStyle}>
                    MARCA / MODELO
                  </th>

                  <th style={headerStyle}>
                    SITUAÇÃO
                  </th>

                  <th style={headerStyle}>
                    PREÇO
                  </th>

                  <th
                    style={{
                      ...headerStyle,
                      textAlign: "right",
                    }}
                  >
                    AÇÕES
                  </th>
                </tr>
              </thead>

              <tbody>
                {impressorasFiltradas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        padding: "48px 16px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "14px",
                      }}
                    >
                      Nenhuma impressora cadastrada
                      ou encontrada.
                    </td>
                  </tr>
                ) : (
                  impressorasFiltradas.map((item) => {
                    const isChecked =
                      selecionados.includes(item.id);

                    return (
                      <tr
                        key={item.id}
                        style={{
                          background: isChecked
                            ? "#f0f9ff"
                            : "transparent",
                          transition:
                            "background 0.15s ease",
                        }}
                      >
                        <td style={cellStyle}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              handleToggleItem(
                                item.id
                              )
                            }
                            style={{
                              cursor: "pointer",
                              width: "16px",
                              height: "16px",
                              accentColor: "#2563eb",
                            }}
                          />
                        </td>

                        <td style={cellStyle}>
                          <strong
                            style={{
                              color: "#2563eb",
                            }}
                          >
                            {item.patrimonio || "—"}
                          </strong>
                        </td>

                        <td style={cellStyle}>
                          {item.ip || "—"}
                        </td>

                        <td style={cellStyle}>
                          {item.local || "—"}
                        </td>

                        <td style={cellStyle}>
                          {item.tipo || "—"}
                        </td>

                        {/* MARCA / MODELO + OBSERVAÇÃO */}

                        <td style={cellStyle}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <strong>
                              {item.marca || ""}

                              {item.marca &&
                              item.modelo
                                ? " / "
                                : ""}

                              {item.modelo || "—"}
                            </strong>

                            {item.observacao?.trim() && (
                              <ObservacaoImpressora
                                observacao={
                                  item.observacao
                                }
                              />
                            )}
                          </div>
                        </td>

                        <td style={cellStyle}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "6px",
                              background:
                                item.situacao ===
                                "Funcionando"
                                  ? "#ecfdf5"
                                  : "#fff7ed",
                              color:
                                item.situacao ===
                                "Funcionando"
                                  ? "#059669"
                                  : "#c2410c",
                              fontSize: "12px",
                              fontWeight: "700",
                            }}
                          >
                            {item.situacao || "—"}
                          </span>
                        </td>

                        <td style={cellStyle}>
                          {Number(
                            item.preco || 0
                          ).toLocaleString(
                            "pt-BR",
                            {
                              style: "currency",
                              currency: "BRL",
                            }
                          )}
                        </td>

                        <td
                          style={{
                            ...cellStyle,
                            textAlign: "right",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent:
                                "flex-end",
                              gap: "8px",
                            }}
                          >
                            <button
                              onClick={() =>
                                setImpressoraEmEdicao(
                                  item
                                )
                              }
                              style={
                                editButtonStyle
                              }
                            >
                              ✏️ Editar
                            </button>

                            <button
                              onClick={() =>
                                handleExcluir(
                                  item.id
                                )
                              }
                              style={
                                deleteButtonStyle
                              }
                            >
                              🗑️ Excluir
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
        )}
      </div>

      {/* MODAL DE EDIÇÃO */}

      {impressoraEmEdicao && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "700px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "28px",
              boxSizing: "border-box",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "800",
                color: "#0f172a",
                marginBottom: "24px",
              }}
            >
              Editar Impressora
            </h2>

            <form onSubmit={handleSalvarEdicao}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, 1fr)",
                  gap: "18px",
                }}
              >
                <CampoEdicao
                  label="Patrimônio"
                  value={
                    impressoraEmEdicao.patrimonio
                  }
                  onChange={(valor) =>
                    setImpressoraEmEdicao({
                      ...impressoraEmEdicao,
                      patrimonio: valor,
                    })
                  }
                />

                <CampoEdicao
                  label="IP"
                  value={impressoraEmEdicao.ip}
                  onChange={(valor) =>
                    setImpressoraEmEdicao({
                      ...impressoraEmEdicao,
                      ip: valor,
                    })
                  }
                />

                <CampoEdicao
                  label="Local"
                  value={impressoraEmEdicao.local}
                  onChange={(valor) =>
                    setImpressoraEmEdicao({
                      ...impressoraEmEdicao,
                      local: valor,
                    })
                  }
                />

                <CampoEdicao
                  label="Tipo"
                  value={impressoraEmEdicao.tipo}
                  onChange={(valor) =>
                    setImpressoraEmEdicao({
                      ...impressoraEmEdicao,
                      tipo: valor,
                    })
                  }
                />

                <CampoEdicao
                  label="Marca"
                  value={impressoraEmEdicao.marca}
                  onChange={(valor) =>
                    setImpressoraEmEdicao({
                      ...impressoraEmEdicao,
                      marca: valor,
                    })
                  }
                />

                <CampoEdicao
                  label="Modelo"
                  value={
                    impressoraEmEdicao.modelo
                  }
                  onChange={(valor) =>
                    setImpressoraEmEdicao({
                      ...impressoraEmEdicao,
                      modelo: valor,
                    })
                  }
                />

                <div>
                  <label style={labelStyle}>
                    Situação
                  </label>

                  <select
                    value={
                      impressoraEmEdicao.situacao
                    }
                    onChange={(e) =>
                      setImpressoraEmEdicao({
                        ...impressoraEmEdicao,
                        situacao:
                          e.target.value,
                      })
                    }
                    style={inputStyle}
                  >
                    <option value="Funcionando">
                      Funcionando
                    </option>

                    <option value="Em manutenção">
                      Em manutenção
                    </option>

                    <option value="Parada">
                      Parada
                    </option>

                    <option value="Inativa">
                      Inativa
                    </option>
                  </select>
                </div>

                <CampoEdicao
                  label="Preço / Aluguel"
                  value={String(
                    impressoraEmEdicao.preco || 0
                  )}
                  onChange={(valor) =>
                    setImpressoraEmEdicao({
                      ...impressoraEmEdicao,
                      preco:
                        parseFloat(
                          valor.replace(",", ".")
                        ) || 0,
                    })
                  }
                />

                <div
                  style={{
                    gridColumn: "1 / -1",
                  }}
                >
                  <CampoEdicao
                    label="Observação"
                    value={
                      impressoraEmEdicao.observacao ||
                      ""
                    }
                    onChange={(valor) =>
                      setImpressoraEmEdicao({
                        ...impressoraEmEdicao,
                        observacao: valor,
                      })
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "24px",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setImpressoraEmEdicao(null)
                  }
                  style={cancelButtonStyle}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  style={saveButtonStyle}
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================================
// COMPONENTES AUXILIARES
// ==========================================================

function Campo({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        style={inputStyle}
      />
    </div>
  );
}

function CampoEdicao({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        style={inputStyle}
      />
    </div>
  );
}

// ==========================================================
// OBSERVAÇÃO DA IMPRESSORA
// ==========================================================

function ObservacaoImpressora({
  observacao,
}: {
  observacao: string;
}) {
  const [aberta, setAberta] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
      }}
      onMouseEnter={() => setAberta(true)}
      onMouseLeave={() => setAberta(false)}
    >
      <button
        type="button"
        onClick={() =>
          setAberta((prev) => !prev)
        }
        title="Ver observação"
        style={{
          width: "26px",
          height: "26px",
          borderRadius: "50%",
          border: "1px solid #bfdbfe",
          background: "#eff6ff",
          color: "#2563eb",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          padding: 0,
        }}
      >
        💬
      </button>

      {aberta && (
        <div
          style={{
            position: "absolute",
            zIndex: 100,
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform:
              "translateX(-50%)",
            width: "280px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "12px 14px",
            boxShadow:
              "0 8px 25px rgba(15, 23, 42, 0.15)",
            whiteSpace: "normal",
            fontSize: "12px",
            color: "#475569",
            lineHeight: "1.5",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: "800",
              color: "#2563eb",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "5px",
            }}
          >
            Observação
          </div>

          {observacao}
        </div>
      )}
    </div>
  );
}

// ==========================================================
// ESTILOS
// ==========================================================

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: "700",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "8px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  fontSize: "14px",
  outline: "none",
  background: "#f8fafc",
  boxSizing: "border-box",
};

const checkboxHeaderStyle: React.CSSProperties = {
  padding: "14px 16px",
  width: "40px",
  borderBottom: "2px solid #e2e8f0",
};

const headerStyle: React.CSSProperties = {
  padding: "10px 10px",
  fontSize: "10px",
  color: "#64748b",
  fontWeight: "800",
  letterSpacing: "0.04em",
  borderBottom: "2px solid #e2e8f0",
  whiteSpace: "nowrap",
};

const cellStyle: React.CSSProperties = {
  padding: "10px 10px",
  borderBottom: "1px solid #f1f5f9",
  fontSize: "12px",
  color: "#334155",
  whiteSpace: "normal",
  verticalAlign: "middle",
};

const editButtonStyle: React.CSSProperties = {
  background: "#f1f5f9",
  color: "#2563eb",
  border: "1px solid #cbd5e1",
  padding: "7px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "700",
};

const deleteButtonStyle: React.CSSProperties = {
  background: "#fef2f2",
  color: "#dc2626",
  border: "1px solid #fecaca",
  padding: "7px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "700",
};

const dangerButtonStyle: React.CSSProperties = {
  background: "#ef4444",
  color: "#ffffff",
  border: "none",
  padding: "7px 14px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "700",
};

const dangerLightButtonStyle: React.CSSProperties = {
  background: "#fff1f2",
  color: "#e11d48",
  border: "1px solid #fecdd3",
  padding: "7px 14px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "700",
};

const cancelButtonStyle: React.CSSProperties = {
  padding: "10px 18px",
  background: "#f1f5f9",
  color: "#475569",
  border: "none",
  borderRadius: "8px",
  fontWeight: "600",
  cursor: "pointer",
};

const saveButtonStyle: React.CSSProperties = {
  padding: "10px 18px",
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  fontWeight: "700",
  cursor: "pointer",
};

export default Impressoras;