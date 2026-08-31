import React, { useRef, useState } from "react";
import api from "../services/api";
import * as XLSX from "xlsx";

export interface Equipamento {
  id: string;
  nome: string;
  patrimonio: string;
  usuario: string;
  local: string;
  valor: number;
  anydesk: string;
  ultravnc: string;
  termoResponsabilidade: string;
}

interface EquipamentosProps {
  equipamentos: Equipamento[];
  setEquipamentos: React.Dispatch<React.SetStateAction<Equipamento[]>>;
}

export function Equipamentos({
  equipamentos,
  setEquipamentos,
}: EquipamentosProps) {
  const [selecionados, setSelecionados] = useState<string[]>([]);

  const [nome, setNome] = useState("");
  const [patrimonio, setPatrimonio] = useState("");
  const [usuario, setUsuario] = useState("");
  const [local, setLocal] = useState("");
  const [anydesk, setAnydesk] = useState("");
  const [ultravnc, setUltravnc] = useState("");
  const [valorInput, setValorInput] = useState("");

  const [busca, setBusca] = useState("");

  const [equipamentoEmEdicao, setEquipamentoEmEdicao] =
    useState<Equipamento | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // =========================================================
  // NORMALIZAR EQUIPAMENTO VINDO DA API
  // =========================================================

  function normalizarEquipamento(item: any): Equipamento {
    return {
      id: String(item?.id ?? ""),
      nome: String(item?.nome ?? ""),
      patrimonio: String(item?.patrimonio ?? ""),
      usuario: String(item?.usuario ?? ""),
      local: String(
        item?.local ??
          item?.localizacao ??
          item?.setorUsuario ??
          ""
      ),
      valor:
        typeof item?.valor === "number"
          ? item.valor
          : Number(item?.valor) || 0,

      anydesk: String(item?.anydesk ?? ""),
      ultravnc: String(item?.ultravnc ?? ""),
      termoResponsabilidade: String(
        item?.termoResponsabilidade ??
          item?.termo_responsabilidade ??
          ""
      ),
    };
  }

  // =========================================================
  // CADASTRAR
  // =========================================================

  const handleAdicionar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim() || !patrimonio.trim()) {
      alert("Por favor, preencha o Nome e o Patrimônio.");
      return;
    }

    const novo = {
      nome: nome.trim(),
      patrimonio: patrimonio.trim(),
      usuario: usuario.trim(),
      localizacao: local.trim(),
      anydesk: anydesk.trim(),
      ultravnc: ultravnc.trim(),
      valor: parseFloat(valorInput.replace(",", ".")) || 0,
    };

    try {
      const resposta = await api.post("/equipamentos", novo);

      const equipamentoCriado = normalizarEquipamento(
        resposta.data
      );

      setEquipamentos((prev) => [
        equipamentoCriado,
        ...prev,
      ]);

      setNome("");
      setPatrimonio("");
      setUsuario("");
      setLocal("");
      setAnydesk("");
      setUltravnc("");
      setValorInput("");

      alert("Equipamento cadastrado com sucesso!");
    } catch (erro: any) {
      console.error(erro);

      alert(
        erro.response?.data?.erro ||
          "Erro ao cadastrar equipamento."
      );
    }
  };

  // =========================================================
  // SALVAR EDIÇÃO
  // =========================================================

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!equipamentoEmEdicao) return;

    if (
      !equipamentoEmEdicao.nome.trim() ||
      !equipamentoEmEdicao.patrimonio.trim()
    ) {
      alert("Nome e Patrimônio são obrigatórios.");
      return;
    }

    try {
      const dadosParaEnviar = {
        nome: equipamentoEmEdicao.nome.trim(),
        patrimonio: equipamentoEmEdicao.patrimonio.trim(),
        usuario: equipamentoEmEdicao.usuario.trim(),
        localizacao: equipamentoEmEdicao.local.trim(),
        anydesk: equipamentoEmEdicao.anydesk.trim(),
        ultravnc: equipamentoEmEdicao.ultravnc.trim(),
        valor: Number(equipamentoEmEdicao.valor) || 0,
        termoResponsabilidade:
          equipamentoEmEdicao.termoResponsabilidade || "",
      };

      const resposta = await api.put(
        `/equipamentos/${equipamentoEmEdicao.id}`,
        dadosParaEnviar
      );

      const equipamentoAtualizado =
        normalizarEquipamento(resposta.data);

      setEquipamentos((prev) =>
        prev.map((item) =>
          String(item.id) ===
          String(equipamentoAtualizado.id)
            ? equipamentoAtualizado
            : item
        )
      );

      setEquipamentoEmEdicao(null);

      alert("Equipamento atualizado com sucesso!");
    } catch (erro: any) {
      console.error(erro);

      alert(
        erro.response?.data?.erro ||
          "Erro ao salvar alterações."
      );
    }
  };

  // =========================================================
  // EXCLUIR UM
  // =========================================================

  const handleExcluirUnico = async (id: string) => {
    if (
      !confirm(
        "Deseja realmente remover este equipamento?"
      )
    ) {
      return;
    }

    try {
      await api.delete(`/equipamentos/${id}`);

      setEquipamentos((prev) =>
        prev.filter(
          (e) => String(e.id) !== String(id)
        )
      );

      setSelecionados((prev) =>
        prev.filter(
          (item) => String(item) !== String(id)
        )
      );
    } catch (erro: any) {
      console.error(erro);

      alert(
        erro.response?.data?.erro ||
          "Erro ao excluir equipamento."
      );
    }
  };

  // =========================================================
  // EXCLUIR SELECIONADOS
  // =========================================================

  const handleExcluirSelecionados = async () => {
    if (selecionados.length === 0) return;

    if (
      !confirm(
        `Tem certeza que deseja excluir os ${selecionados.length} itens selecionados?`
      )
    ) {
      return;
    }

    try {
      await Promise.all(
        selecionados.map((id) =>
          api.delete(`/equipamentos/${id}`)
        )
      );

      setEquipamentos((prev) =>
        prev.filter(
          (e) =>
            !selecionados.includes(String(e.id))
        )
      );

      setSelecionados([]);
    } catch (erro: any) {
      console.error(erro);

      alert(
        erro.response?.data?.erro ||
          "Erro ao excluir os equipamentos selecionados."
      );
    }
  };

  // =========================================================
  // EXCLUIR TODOS
  // =========================================================

  const handleExcluirTodos = async () => {
    if (equipamentos.length === 0) return;

    if (
      !confirm(
        "⚠️ ATENÇÃO: Deseja apagar TODOS os equipamentos cadastrados no sistema?"
      )
    ) {
      return;
    }

    try {
      await api.delete("/equipamentos");

      setEquipamentos([]);
      setSelecionados([]);
    } catch (erro: any) {
      console.error(erro);

      alert(
        erro.response?.data?.erro ||
          "Erro ao excluir os equipamentos."
      );
    }
  };

  // =========================================================
  // UPLOAD DO TERMO
  // =========================================================

  const handleUploadTermo = async (
    id: string,
    file: File
  ) => {
    try {
      const formData = new FormData();

      formData.append("termo", file);

      const resposta = await api.post(
        `/equipamentos/${id}/termo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const arquivo =
        resposta.data?.arquivo || "";

      setEquipamentos((prev) =>
        prev.map((item) =>
          String(item.id) === String(id)
            ? {
                ...item,
                termoResponsabilidade: arquivo,
              }
            : item
        )
      );

      if (equipamentoEmEdicao) {
        setEquipamentoEmEdicao((prev) =>
          prev
            ? {
                ...prev,
                termoResponsabilidade: arquivo,
              }
            : null
        );
      }

      alert(
        "Termo de responsabilidade enviado com sucesso!"
      );
    } catch (erro: any) {
      console.error(erro);

      alert(
        erro.response?.data?.erro ||
          "Erro ao enviar o termo de responsabilidade."
      );
    }
  };

  // =========================================================
  // EXCLUIR TERMO
  // =========================================================

  const handleExcluirTermo = async (id: string) => {
    if (
      !confirm(
        "Deseja realmente remover o termo de responsabilidade?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/equipamentos/${id}/termo`
      );

      setEquipamentos((prev) =>
        prev.map((item) =>
          String(item.id) === String(id)
            ? {
                ...item,
                termoResponsabilidade: "",
              }
            : item
        )
      );

      if (
        equipamentoEmEdicao &&
        String(equipamentoEmEdicao.id) ===
          String(id)
      ) {
        setEquipamentoEmEdicao((prev) =>
          prev
            ? {
                ...prev,
                termoResponsabilidade: "",
              }
            : null
        );
      }

      alert("Termo removido com sucesso!");
    } catch (erro: any) {
      console.error(erro);

      alert(
        erro.response?.data?.erro ||
          "Erro ao remover o termo."
      );
    }
  };

  // =========================================================
  // ABRIR TERMO
  // =========================================================

  const abrirTermo = (arquivo: string) => {
    if (!arquivo) return;

    const baseURL =
      api.defaults.baseURL ||
      "http://localhost:3001/api";

    const servidorURL = baseURL.replace(
      /\/api\/?$/,
      ""
    );

    const url = `${servidorURL}/uploads/termos/${arquivo}`;

    window.open(url, "_blank");
  };

  // =========================================================
  // EXPORTAR EXCEL
  // =========================================================

  const handleExportarExcel = () => {
    if (equipamentos.length === 0) {
      alert("Não há dados para exportar!");
      return;
    }

    const dadosExcel = equipamentos.map(
      (item) => ({
        LOCAL: item?.local || "",
        RESPONSAVEL: item?.usuario || "",
        EQUIPAMENTO: item?.nome || "",
        PATRIMÔNIO: item?.patrimonio || "",
        ANYDESK: item?.anydesk || "",
        ULTRAVNC: item?.ultravnc || "",
        VALOR: item?.valor || 0,
        TERMO:
          item?.termoResponsabilidade
            ? "ANEXADO"
            : "NÃO ANEXADO",
      })
    );

    const worksheet =
      XLSX.utils.json_to_sheet(dadosExcel);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Equipamentos"
    );

    XLSX.writeFile(
      workbook,
      `Ativos_TI_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`
    );
  };

  // =========================================================
  // IMPORTAR EXCEL
  // =========================================================

  const handleImportarExcel = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;

        if (!bstr) {
          alert(
            "Não foi possível ler o arquivo."
          );
          return;
        }

        const wb = XLSX.read(bstr, {
          type: "binary",
        });

        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        const rawData =
          XLSX.utils.sheet_to_json<any>(ws, {
            defval: "",
          });

        if (rawData.length === 0) {
          alert(
            "A planilha importada está vazia."
          );
          return;
        }

        // -----------------------------------------------------
        // NORMALIZAR TEXTO
        // -----------------------------------------------------

        const normalizarTexto = (texto: any) =>
          String(texto ?? "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[\_-]/g, " ")
            .replace(/\s+/g, " ");

        const getVal = (
          row: any,
          nomesPossiveis: string[]
        ) => {
          const keys = Object.keys(row);

          for (const key of keys) {
            const chaveNormalizada =
              normalizarTexto(key);

            for (const nome of nomesPossiveis) {
              const nomeNormalizado =
                normalizarTexto(nome);

              if (
                chaveNormalizada ===
                  nomeNormalizado ||
                chaveNormalizada.includes(
                  nomeNormalizado
                )
              ) {
                return row[key];
              }
            }
          }

          return "";
        };

        // -----------------------------------------------------
        // MONTAR EQUIPAMENTOS
        // -----------------------------------------------------

        const novosEquipamentos =
          rawData
            .map((row, index) => {
              const localVal = getVal(
                row,
                [
                  "local",
                  "localizacao",
                  "localização",
                  "setor",
                  "setor departamento",
                  "departamento",
                ]
              );

              const respVal = getVal(
                row,
                [
                  "responsavel",
                  "responsável",
                  "usuario",
                  "usuário",
                  "nome responsavel",
                ]
              );

              const equipVal = getVal(
                row,
                [
                  "equipamento",
                  "equipamento modelo",
                  "modelo",
                  "item",
                  "nome",
                ]
              );

              const marcaVal = getVal(
                row,
                [
                  "marca",
                  "fabricante",
                ]
              );

              const patrimVal = getVal(
                row,
                [
                  "patrimonio",
                  "patrimônio",
                  "etiqueta",
                  "tag",
                ]
              );

              const valorVal = getVal(
                row,
                [
                  "valor",
                  "preco",
                  "preço",
                  "valor aquisicao",
                  "valor aquisição",
                ]
              );

              const anydeskVal = getVal(
                row,
                [
                  "anydesk",
                  "any desk",
                  "id anydesk",
                ]
              );

              const ultravncVal = getVal(
                row,
                [
                  "ultravnc",
                  "ultra vnc",
                  "ultra-vnc",
                  "id ultravnc",
                ]
              );

              // -------------------------------------------------
              // NOME
              // -------------------------------------------------

              let nomeCompleto =
                String(
                  equipVal || ""
                ).trim();

              if (
                marcaVal &&
                String(marcaVal).trim()
              ) {
                nomeCompleto = `${nomeCompleto} (${String(
                  marcaVal
                ).trim()})`;
              }

              if (!nomeCompleto) {
                nomeCompleto =
                  "Equipamento TI";
              }

              // -------------------------------------------------
              // VALOR
              // -------------------------------------------------

              let valorNum = 0;

              if (
                typeof valorVal === "number"
              ) {
                valorNum = valorVal;
              } else if (valorVal) {
                let valorTexto =
                  String(valorVal).trim();

                valorTexto = valorTexto
                  .replace(/R\$/gi, "")
                  .replace(/\s/g, "");

                if (
                  valorTexto.includes(",") &&
                  valorTexto.includes(".")
                ) {
                  valorTexto = valorTexto
                    .replace(/\./g, "")
                    .replace(",", ".");
                } else if (
                  valorTexto.includes(",")
                ) {
                  valorTexto =
                    valorTexto.replace(
                      ",",
                      "."
                    );
                }

                valorNum =
                  parseFloat(
                    valorTexto
                  ) || 0;
              }

              return {
                patrimonio:
                  String(
                    patrimVal ||
                      `PAT-${index + 1}`
                  ).trim(),

                nome: nomeCompleto,

                usuario:
                  String(
                    respVal ?? ""
                  ).trim(),

                localizacao:
                  String(
                    localVal ?? ""
                  ).trim(),

                anydesk:
                  String(
                    anydeskVal ?? ""
                  ).trim(),

                ultravnc:
                  String(
                    ultravncVal ?? ""
                  ).trim(),

                valor: valorNum,
              };
            })
            .filter(
              (item) =>
                item.nome ||
                item.patrimonio ||
                item.localizacao
            );

        if (
          novosEquipamentos.length === 0
        ) {
          alert(
            "Nenhum equipamento válido foi encontrado na planilha."
          );
          return;
        }

        console.log(
          "Equipamentos preparados para importação:",
          novosEquipamentos
        );

        // -----------------------------------------------------
        // ENVIAR PARA API
        // -----------------------------------------------------

        const resposta = await api.post(
          "/equipamentos/bulk",
          novosEquipamentos
        );

        const dadosResposta =
          resposta.data;

        const importadosRaw =
          Array.isArray(
            dadosResposta?.equipamentos
          )
            ? dadosResposta.equipamentos
            : Array.isArray(dadosResposta)
            ? dadosResposta
            : novosEquipamentos;

        const importados =
          importadosRaw.map(
            normalizarEquipamento
          );

        setEquipamentos((prev) => [
          ...importados,
          ...prev,
        ]);

        alert(
          `🎉 Sucesso! ${importados.length} itens importados.`
        );
      } catch (erro: any) {
        console.error(
          "ERRO COMPLETO NA IMPORTAÇÃO:",
          erro
        );

        console.error(
          "RESPOSTA DA API:",
          erro?.response?.data
        );

        alert(
          erro?.response?.data?.erro ||
            erro?.response?.data?.message ||
            "Erro ao importar. Verifique o arquivo Excel e o servidor."
        );
      }
    };

    reader.readAsBinaryString(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =========================================================
  // FILTRO
  // =========================================================

  const equipamentosFiltrados = (
    equipamentos || []
  ).filter((item) => {
    const termo =
      busca.toLowerCase();

    return (
      String(item?.nome || "")
        .toLowerCase()
        .includes(termo) ||
      String(item?.patrimonio || "")
        .toLowerCase()
        .includes(termo) ||
      String(item?.usuario || "")
        .toLowerCase()
        .includes(termo) ||
      String(item?.local || "")
        .toLowerCase()
        .includes(termo) ||
      String(item?.anydesk || "")
        .toLowerCase()
        .includes(termo) ||
      String(item?.ultravnc || "")
        .toLowerCase()
        .includes(termo)
    );
  });

  const todosSelecionados =
    equipamentosFiltrados.length > 0 &&
    equipamentosFiltrados.every((item) =>
      selecionados.includes(
        String(item.id)
      )
    );

  const handleToggleSelecionarTodos =
    () => {
      if (todosSelecionados) {
        setSelecionados([]);
      } else {
        setSelecionados(
          equipamentosFiltrados.map(
            (item) => String(item.id)
          )
        );
      }
    };

  const handleToggleItem = (
    id: string
  ) => {
    setSelecionados((prev) =>
      prev.includes(id)
        ? prev.filter(
            (item) => item !== id
          )
        : [...prev, id]
    );
  };

  // =========================================================
  // TELA
  // =========================================================

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        padding: "0 16px 40px",
        boxSizing: "border-box",
        fontFamily:
          "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          marginBottom: "32px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "800",
              color: "#0f172a",
              letterSpacing: "-0.03em",
              margin: "0 0 6px",
            }}
          >
            Gerenciamento de Equipamentos
          </h1>

          <p
            style={{
              color: "#64748b",
              fontSize: "14px",
              margin: 0,
            }}
          >
            Controle de inventário, atribuição de
            ativos e histórico de patrimônios de TI.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
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
            }}
          >
            📥 Importar Excel
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
            }}
          >
            📊 Exportar Excel
          </button>
        </div>
      </div>

      {/* FORMULÁRIO */}

      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          padding: "28px",
          marginBottom: "32px",
          boxSizing: "border-box",
        }}
      >
        <h2
          style={{
            fontSize: "17px",
            fontWeight: "700",
            color: "#0f172a",
            marginBottom: "24px",
          }}
        >
          Cadastrar Novo Equipamento
        </h2>

        <form onSubmit={handleAdicionar}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
            }}
          >
            <div>
              <label>
                Equipamento / Modelo *
              </label>

              <input
                type="text"
                placeholder="Ex: Notebook Dell"
                value={nome}
                onChange={(e) =>
                  setNome(e.target.value)
                }
                style={inputStyle}
              />
            </div>

            <div>
              <label>
                Patrimônio / Etiqueta *
              </label>

              <input
                type="text"
                placeholder="Ex: M&S-18664"
                value={patrimonio}
                onChange={(e) =>
                  setPatrimonio(
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </div>

            <div>
              <label>
                Usuário Responsável
              </label>

              <input
                type="text"
                placeholder="Ex: Lili Pires"
                value={usuario}
                onChange={(e) =>
                  setUsuario(
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </div>

            <div>
              <label>Local</label>

              <input
                type="text"
                placeholder="Ex: Recepção, TI, 3º andar"
                value={local}
                onChange={(e) =>
                  setLocal(
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </div>

            <div>
              <label>AnyDesk</label>

              <input
                type="text"
                placeholder="Ex: 123 456 789"
                value={anydesk}
                onChange={(e) =>
                  setAnydesk(
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </div>

            <div>
              <label>UltraVNC</label>

              <input
                type="text"
                placeholder="Ex: 192.168.1.100"
                value={ultravnc}
                onChange={(e) =>
                  setUltravnc(
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </div>

            <div>
              <label>
                Valor de Aquisição (R$)
              </label>

              <input
                type="number"
                step="0.01"
                placeholder="280,00"
                value={valorInput}
                onChange={(e) =>
                  setValorInput(
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </div>

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
                }}
              >
                + Cadastrar Item
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* TABELA */}

      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          padding: "28px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <h2
              style={{
                fontSize: "17px",
                fontWeight: "700",
                color: "#0f172a",
                margin: 0,
              }}
            >
              Equipamentos Cadastrados
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
              {equipamentosFiltrados.length}
            </span>

            {selecionados.length > 0 && (
              <button
                onClick={
                  handleExcluirSelecionados
                }
                style={dangerButtonStyle}
              >
                🗑️ Excluir Selecionados (
                {selecionados.length})
              </button>
            )}

            {equipamentos.length > 0 && (
              <button
                onClick={handleExcluirTodos}
                style={dangerAllButtonStyle}
              >
                ⚠️ Excluir Tudo
              </button>
            )}
          </div>

          <input
            type="text"
            placeholder="🔍 Buscar patrimônio, equipamento, pessoa, local ou acesso..."
            value={busca}
            onChange={(e) =>
              setBusca(e.target.value)
            }
            style={{
              ...inputStyle,
              width: "350px",
              maxWidth: "100%",
            }}
          />
        </div>

        <div
          style={{
            width: "100%",
            overflowX: "auto",
            WebkitOverflowScrolling:
              "touch",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: "1250px",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                }}
              >
                <th style={thStyle}>
                  <input
                    type="checkbox"
                    checked={
                      todosSelecionados
                    }
                    onChange={
                      handleToggleSelecionarTodos
                    }
                  />
                </th>

                <th style={thStyle}>
                  PATRIMÔNIO
                </th>

                <th style={thStyle}>
                  EQUIPAMENTO / MODELO
                </th>

                <th style={thStyle}>
                  RESPONSÁVEL
                </th>

                <th style={thStyle}>
                  LOCAL
                </th>

                <th style={thStyle}>
                  ANYDESK
                </th>

                <th style={thStyle}>
                  ULTRAVNC
                </th>

                <th style={thStyle}>
                  VALOR
                </th>

                <th style={thStyle}>
                  TERMO
                </th>

                <th
                  style={{
                    ...thStyle,
                    textAlign: "right",
                  }}
                >
                  AÇÕES
                </th>
              </tr>
            </thead>

            <tbody>
              {equipamentosFiltrados.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={10}
                    style={{
                      padding:
                        "48px 16px",
                      textAlign:
                        "center",
                      color:
                        "#94a3b8",
                    }}
                  >
                    Nenhum equipamento
                    cadastrado ou encontrado.
                  </td>
                </tr>
              ) : (
                equipamentosFiltrados.map(
                  (item, index) => {
                    const idItem =
                      String(
                        item?.id ||
                          `item-${index}`
                      );

                    const isChecked =
                      selecionados.includes(
                        idItem
                      );

                    const valorNum =
                      Number(
                        item?.valor
                      ) || 0;

                    return (
                      <tr
                        key={idItem}
                        style={{
                          background:
                            isChecked
                              ? "#f0f9ff"
                              : "#ffffff",
                        }}
                      >
                        <td style={tdStyle}>
                          <input
                            type="checkbox"
                            checked={
                              isChecked
                            }
                            onChange={() =>
                              handleToggleItem(
                                idItem
                              )
                            }
                          />
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            color:
                              "#2563eb",
                            fontWeight:
                              "700",
                          }}
                        >
                          {item?.patrimonio ||
                            "—"}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            fontWeight:
                              "600",
                          }}
                        >
                          {item?.nome ||
                            "—"}
                        </td>

                        <td style={tdStyle}>
                          {item?.usuario ||
                            "Não informado"}
                        </td>

                        <td style={tdStyle}>
                          <span
                            style={{
                              background:
                                item?.local
                                  ? "#eff6ff"
                                  : "#f1f5f9",
                              color:
                                item?.local
                                  ? "#2563eb"
                                  : "#94a3b8",
                              padding:
                                "5px 10px",
                              borderRadius:
                                "6px",
                              fontSize:
                                "12px",
                              fontWeight:
                                "600",
                            }}
                          >
                            {item?.local ||
                              "Não informado"}
                          </span>
                        </td>

                        <td style={tdStyle}>
                          {item?.anydesk ? (
                            <span
                              style={{
                                background:
                                  "#ecfdf5",
                                color:
                                  "#059669",
                                padding:
                                  "5px 10px",
                                borderRadius:
                                  "6px",
                                fontSize:
                                  "12px",
                                fontWeight:
                                  "700",
                              }}
                            >
                              {item.anydesk}
                            </span>
                          ) : (
                            <span
                              style={{
                                color:
                                  "#94a3b8",
                              }}
                            >
                              —
                            </span>
                          )}
                        </td>

                        <td style={tdStyle}>
                          {item?.ultravnc ? (
                            <span
                              style={{
                                background:
                                  "#fef3c7",
                                color:
                                  "#b45309",
                                padding:
                                  "5px 10px",
                                borderRadius:
                                  "6px",
                                fontSize:
                                  "12px",
                                fontWeight:
                                  "700",
                              }}
                            >
                              {item.ultravnc}
                            </span>
                          ) : (
                            <span
                              style={{
                                color:
                                  "#94a3b8",
                              }}
                            >
                              —
                            </span>
                          )}
                        </td>

                        <td style={tdStyle}>
                          {valorNum.toLocaleString(
                            "pt-BR",
                            {
                              style:
                                "currency",
                              currency:
                                "BRL",
                            }
                          )}
                        </td>

                        <td style={tdStyle}>
                          {item?.termoResponsabilidade ? (
                            <div
                              style={{
                                display:
                                  "flex",
                                gap: "6px",
                                alignItems:
                                  "center",
                              }}
                            >
                              <button
                                onClick={() =>
                                  abrirTermo(
                                    item.termoResponsabilidade
                                  )
                                }
                                style={
                                  termViewButtonStyle
                                }
                              >
                                👁️ Ver
                              </button>

                              <button
                                onClick={() =>
                                  handleExcluirTermo(
                                    idItem
                                  )
                                }
                                style={
                                  termDeleteButtonStyle
                                }
                              >
                                🗑️
                              </button>
                            </div>
                          ) : (
                            <label
                              style={
                                termUploadButtonStyle
                              }
                            >
                              📎 Anexar
                              <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp,.pdf"
                                style={{
                                  display:
                                    "none",
                                }}
                                onChange={(
                                  e
                                ) => {
                                  const file =
                                    e.target
                                      .files?.[0];

                                  if (
                                    file
                                  ) {
                                    handleUploadTermo(
                                      idItem,
                                      file
                                    );
                                  }

                                  e.currentTarget.value =
                                    "";
                                }}
                              />
                            </label>
                          )}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            textAlign:
                              "right",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              gap: "8px",
                              justifyContent:
                                "flex-end",
                            }}
                          >
                            <button
                              onClick={() =>
                                setEquipamentoEmEdicao(
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
                                handleExcluirUnico(
                                  idItem
                                )
                              }
                              style={
                                deleteButtonStyle
                              }
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          MODAL DE EDIÇÃO
      ===================================================== */}

      {equipamentoEmEdicao && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.6)",
            display: "flex",
            justifyContent:
              "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "20px",
            boxSizing:
              "border-box",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "540px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "28px",
              boxSizing:
                "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "800",
                  color:
                    "#0f172a",
                  margin: 0,
                }}
              >
                ✏️ Editar Equipamento
              </h2>

              <button
                onClick={() =>
                  setEquipamentoEmEdicao(
                    null
                  )
                }
                style={{
                  background:
                    "none",
                  border: "none",
                  fontSize:
                    "20px",
                  cursor:
                    "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={
                handleSalvarEdicao
              }
            >
              <div
                style={{
                  display:
                    "flex",
                  flexDirection:
                    "column",
                  gap: "16px",
                }}
              >
                <div>
                  <label>
                    Patrimônio *
                  </label>

                  <input
                    type="text"
                    value={
                      equipamentoEmEdicao.patrimonio
                    }
                    onChange={(e) =>
                      setEquipamentoEmEdicao(
                        {
                          ...equipamentoEmEdicao,
                          patrimonio:
                            e.target.value,
                        }
                      )
                    }
                    style={
                      inputStyle
                    }
                  />
                </div>

                <div>
                  <label>
                    Equipamento / Modelo *
                  </label>

                  <input
                    type="text"
                    value={
                      equipamentoEmEdicao.nome
                    }
                    onChange={(e) =>
                      setEquipamentoEmEdicao(
                        {
                          ...equipamentoEmEdicao,
                          nome:
                            e.target.value,
                        }
                      )
                    }
                    style={
                      inputStyle
                    }
                  />
                </div>

                <div>
                  <label>
                    Usuário Responsável
                  </label>

                  <input
                    type="text"
                    value={
                      equipamentoEmEdicao.usuario
                    }
                    onChange={(e) =>
                      setEquipamentoEmEdicao(
                        {
                          ...equipamentoEmEdicao,
                          usuario:
                            e.target.value,
                        }
                      )
                    }
                    style={
                      inputStyle
                    }
                  />
                </div>

                <div>
                  <label>
                    Local
                  </label>

                  <input
                    type="text"
                    value={
                      equipamentoEmEdicao.local
                    }
                    onChange={(e) =>
                      setEquipamentoEmEdicao(
                        {
                          ...equipamentoEmEdicao,
                          local:
                            e.target.value,
                        }
                      )
                    }
                    placeholder="Ex: TI, Recepção, 3º andar"
                    style={
                      inputStyle
                    }
                  />
                </div>

                <div>
                  <label>
                    AnyDesk
                  </label>

                  <input
                    type="text"
                    value={
                      equipamentoEmEdicao.anydesk
                    }
                    onChange={(e) =>
                      setEquipamentoEmEdicao(
                        {
                          ...equipamentoEmEdicao,
                          anydesk:
                            e.target.value,
                        }
                      )
                    }
                    placeholder="ID do AnyDesk"
                    style={
                      inputStyle
                    }
                  />
                </div>

                <div>
                  <label>
                    UltraVNC
                  </label>

                  <input
                    type="text"
                    value={
                      equipamentoEmEdicao.ultravnc
                    }
                    onChange={(e) =>
                      setEquipamentoEmEdicao(
                        {
                          ...equipamentoEmEdicao,
                          ultravnc:
                            e.target.value,
                        }
                      )
                    }
                    placeholder="IP ou identificação do UltraVNC"
                    style={
                      inputStyle
                    }
                  />
                </div>

                <div>
                  <label>
                    Valor (R$)
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    value={
                      equipamentoEmEdicao.valor
                    }
                    onChange={(e) =>
                      setEquipamentoEmEdicao(
                        {
                          ...equipamentoEmEdicao,
                          valor:
                            parseFloat(
                              e.target.value
                            ) || 0,
                        }
                      )
                    }
                    style={
                      inputStyle
                    }
                  />
                </div>

                {/* TERMO */}

                <div>
                  <label>
                    Termo de Responsabilidade
                  </label>

                  <div
                    style={{
                      marginTop:
                        "7px",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: "10px",
                      flexWrap:
                        "wrap",
                    }}
                  >
                    {equipamentoEmEdicao.termoResponsabilidade ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            abrirTermo(
                              equipamentoEmEdicao.termoResponsabilidade
                            )
                          }
                          style={
                            termViewButtonStyle
                          }
                        >
                          👁️ Visualizar Termo
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleExcluirTermo(
                              equipamentoEmEdicao.id
                            )
                          }
                          style={
                            termDeleteButtonStyle
                          }
                        >
                          🗑️ Remover
                        </button>
                      </>
                    ) : (
                      <label
                        style={
                          termUploadLargeStyle
                        }
                      >
                        📎 Anexar Termo

                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,.pdf"
                          style={{
                            display:
                              "none",
                          }}
                          onChange={(
                            e
                          ) => {
                            const file =
                              e.target
                                .files?.[0];

                            if (
                              file
                            ) {
                              handleUploadTermo(
                                equipamentoEmEdicao.id,
                                file
                              );
                            }

                            e.currentTarget.value =
                              "";
                          }}
                        />
                      </label>
                    )}
                  </div>

                  <small
                    style={{
                      display:
                        "block",
                      marginTop:
                        "8px",
                      color:
                        "#94a3b8",
                      fontSize:
                        "11px",
                    }}
                  >
                    Formatos permitidos:
                    PDF, JPG, JPEG, PNG e
                    WEBP. Máximo 5 MB.
                  </small>
                </div>

                <div
                  style={{
                    display:
                      "flex",
                    gap: "12px",
                    justifyContent:
                      "flex-end",
                    marginTop:
                      "12px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setEquipamentoEmEdicao(
                        null
                      )
                    }
                    style={{
                      padding:
                        "10px 18px",
                      background:
                        "#f1f5f9",
                      color:
                        "#475569",
                      border:
                        "none",
                      borderRadius:
                        "8px",
                      fontWeight:
                        "600",
                      cursor:
                        "pointer",
                    }}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    style={{
                      padding:
                        "10px 18px",
                      background:
                        "#2563eb",
                      color:
                        "#ffffff",
                      border:
                        "none",
                      borderRadius:
                        "8px",
                      fontWeight:
                        "700",
                      cursor:
                        "pointer",
                    }}
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

// =========================================================
// ESTILOS
// =========================================================

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  fontSize: "14px",
  outline: "none",
  background: "#f8fafc",
  boxSizing: "border-box",
  marginTop: "7px",
};

const thStyle: React.CSSProperties = {
  padding: "14px 16px",
  fontSize: "11px",
  color: "#64748b",
  fontWeight: "800",
  letterSpacing: "0.05em",
  borderBottom:
    "2px solid #e2e8f0",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderBottom:
    "1px solid #f1f5f9",
  fontSize: "13px",
  color: "#334155",
  whiteSpace: "nowrap",
};

const editButtonStyle: React.CSSProperties = {
  background: "#f1f5f9",
  color: "#2563eb",
  border:
    "1px solid #cbd5e1",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "600",
};

const deleteButtonStyle: React.CSSProperties = {
  background: "#fef2f2",
  color: "#dc2626",
  border:
    "1px solid #fecaca",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "600",
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

const dangerAllButtonStyle: React.CSSProperties = {
  background: "#fff1f2",
  color: "#e11d48",
  border:
    "1px solid #fecdd3",
  padding: "7px 14px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "700",
};

const termUploadButtonStyle: React.CSSProperties = {
  display: "inline-block",
  background: "#eff6ff",
  color: "#2563eb",
  border:
    "1px solid #bfdbfe",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "700",
};

const termUploadLargeStyle: React.CSSProperties = {
  display: "inline-block",
  background: "#eff6ff",
  color: "#2563eb",
  border:
    "1px solid #bfdbfe",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "700",
};

const termViewButtonStyle: React.CSSProperties = {
  background: "#ecfdf5",
  color: "#059669",
  border:
    "1px solid #a7f3d0",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "700",
};

const termDeleteButtonStyle: React.CSSProperties = {
  background: "#fef2f2",
  color: "#dc2626",
  border:
    "1px solid #fecaca",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "700",
};

export default Equipamentos;