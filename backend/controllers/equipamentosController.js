const db = require("../database/database");
const fs = require("fs");
const path = require("path");

function normalizarEquipamento(body) {
  return {
    nome: String(body.nome || "").trim(),

    categoria: String(
      body.categoria || ""
    ).trim(),

    patrimonio: String(
      body.patrimonio || ""
    ).trim(),

    status: String(
      body.status || "ativo"
    ).trim(),

    localizacao: String(
      body.localizacao ||
        body.local ||
        ""
    ).trim(),

    observacoes: String(
      body.observacoes || ""
    ).trim(),

    usuario: String(
      body.usuario || ""
    ).trim(),

    setorUsuario: String(
      body.setorUsuario ||
        body.setor_usuario ||
        ""
    ).trim(),

    valor: Number(body.valor) || 0,

    anydesk: String(
      body.anydesk || ""
    ).trim(),

    ultravnc: String(
      body.ultravnc || ""
    ).trim(),

    termoResponsabilidade: String(
      body.termoResponsabilidade ||
        body.termo_responsabilidade ||
        ""
    ).trim(),
  };
}

function validar(equipamento) {
  if (
    !equipamento.nome ||
    !equipamento.patrimonio
  ) {
    return "Nome e Patrimonio sao obrigatorios.";
  }

  return null;
}

function mapear(row) {
  return {
    id: row.id,

    nome: row.nome || "",

    categoria: row.categoria || "",

    patrimonio:
      row.patrimonio || "",

    status:
      row.status || "ativo",

    local:
      row.localizacao || "",

    localizacao:
      row.localizacao || "",

    observacoes:
      row.observacoes || "",

    usuario:
      row.usuario || "",

    setorUsuario:
      row.setor_usuario || "",

    valor:
      Number(row.valor) || 0,

    anydesk:
      row.anydesk || "",

    ultravnc:
      row.ultravnc || "",

    termoResponsabilidade:
      row.termo_responsabilidade || "",

    criado_por:
      row.criado_por || null,

    criado_em:
      row.criado_em || null,

    atualizado_em:
      row.atualizado_em || null,
  };
}

// ==========================================
// LISTAR
// ==========================================
exports.listar = (req, res) => {
  db.all(
    `
    SELECT
      id,
      nome,
      categoria,
      patrimonio,
      status,
      localizacao,
      observacoes,
      usuario,
      setor_usuario,
      valor,
      anydesk,
      ultravnc,
      termo_responsabilidade,
      criado_por,
      criado_em,
      atualizado_em
    FROM equipamentos
    ORDER BY criado_em DESC
    `,
    [],
    (err, rows) => {
      if (err) {
        console.error(
          "Erro ao listar equipamentos:",
          err
        );

        return res.status(500).json({
          erro:
            "Erro ao consultar equipamentos.",
          detalhe: err.message,
        });
      }

      res.json(
        rows.map(mapear)
      );
    }
  );
};

// ==========================================
// CRIAR
// ==========================================
exports.criar = (req, res) => {
  const equipamento =
    normalizarEquipamento(req.body);

  const erro =
    validar(equipamento);

  if (erro) {
    return res.status(400).json({
      erro,
    });
  }

  db.run(
    `
    INSERT INTO equipamentos
    (
      nome,
      categoria,
      patrimonio,
      status,
      localizacao,
      observacoes,
      usuario,
      setor_usuario,
      valor,
      anydesk,
      ultravnc,
      termo_responsabilidade,
      criado_por
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      equipamento.nome,
      equipamento.categoria,
      equipamento.patrimonio,
      equipamento.status,
      equipamento.localizacao,
      equipamento.observacoes,
      equipamento.usuario,
      equipamento.setorUsuario,
      equipamento.valor,
      equipamento.anydesk,
      equipamento.ultravnc,
      equipamento.termoResponsabilidade,
      req.usuario?.id || null,
    ],
    function (err) {
      if (err) {
        console.error(
          "Erro ao cadastrar equipamento:",
          err
        );

        return res.status(500).json({
          erro:
            "Erro ao cadastrar equipamento.",
          detalhe: err.message,
        });
      }

      res.status(201).json({
        id: this.lastID,
        ...equipamento,
      });
    }
  );
};

// ==========================================
// ATUALIZAR
// ==========================================
exports.atualizar = (req, res) => {
  const equipamento =
    normalizarEquipamento(req.body);

  const erro =
    validar(equipamento);

  if (erro) {
    return res.status(400).json({
      erro,
    });
  }

  db.run(
    `
    UPDATE equipamentos
    SET
      nome = ?,
      categoria = ?,
      patrimonio = ?,
      status = ?,
      localizacao = ?,
      observacoes = ?,
      usuario = ?,
      setor_usuario = ?,
      valor = ?,
      anydesk = ?,
      ultravnc = ?,
      termo_responsabilidade = ?,
      atualizado_em = CURRENT_TIMESTAMP
    WHERE id = ?
    `,
    [
      equipamento.nome,
      equipamento.categoria,
      equipamento.patrimonio,
      equipamento.status,
      equipamento.localizacao,
      equipamento.observacoes,
      equipamento.usuario,
      equipamento.setorUsuario,
      equipamento.valor,
      equipamento.anydesk,
      equipamento.ultravnc,
      equipamento.termoResponsabilidade,
      req.params.id,
    ],
    function (err) {
      if (err) {
        console.error(
          "Erro ao atualizar equipamento:",
          err
        );

        return res.status(500).json({
          erro:
            "Erro ao atualizar equipamento.",
          detalhe: err.message,
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          erro:
            "Equipamento nao encontrado.",
        });
      }

      res.json({
        id: Number(req.params.id),
        ...equipamento,
      });
    }
  );
};

// ==========================================
// EXCLUIR UM
// ==========================================
exports.excluir = (req, res) => {
  db.get(
    `
    SELECT termo_responsabilidade
    FROM equipamentos
    WHERE id = ?
    `,
    [req.params.id],
    (selectErr, equipamento) => {
      if (selectErr) {
        return res.status(500).json({
          erro:
            "Erro ao localizar equipamento.",
        });
      }

      db.run(
        `
        DELETE FROM equipamentos
        WHERE id = ?
        `,
        [req.params.id],
        function (err) {
          if (err) {
            console.error(
              "Erro ao excluir equipamento:",
              err
            );

            return res.status(500).json({
              erro:
                "Erro ao excluir equipamento.",
              detalhe: err.message,
            });
          }

          if (this.changes === 0) {
            return res.status(404).json({
              erro:
                "Equipamento nao encontrado.",
            });
          }

          if (
            equipamento?.termo_responsabilidade
          ) {
            removerArquivoTermo(
              equipamento.termo_responsabilidade
            );
          }

          res.json({
            mensagem:
              "Equipamento excluido com sucesso.",
          });
        }
      );
    }
  );
};

// ==========================================
// EXCLUIR TODOS
// ==========================================
exports.excluirTodos = (req, res) => {
  db.all(
    `
    SELECT termo_responsabilidade
    FROM equipamentos
    WHERE termo_responsabilidade IS NOT NULL
    AND termo_responsabilidade != ''
    `,
    [],
    (selectErr, arquivos) => {
      if (selectErr) {
        return res.status(500).json({
          erro:
            "Erro ao consultar os termos.",
        });
      }

      db.run(
        "DELETE FROM equipamentos",
        [],
        function (err) {
          if (err) {
            console.error(
              "Erro ao excluir equipamentos:",
              err
            );

            return res.status(500).json({
              erro:
                "Erro ao excluir equipamentos.",
              detalhe: err.message,
            });
          }

          arquivos.forEach((item) => {
            removerArquivoTermo(
              item.termo_responsabilidade
            );
          });

          res.json({
            mensagem:
              `${this.changes} equipamento(s) excluido(s).`,
          });
        }
      );
    }
  );
};

// ==========================================
// UPLOAD DO TERMO
// ==========================================
exports.uploadTermo = (req, res) => {
  const id = req.params.id;

  if (!req.file) {
    return res.status(400).json({
      erro:
        "Nenhuma imagem foi enviada.",
    });
  }

  db.get(
    `
    SELECT termo_responsabilidade
    FROM equipamentos
    WHERE id = ?
    `,
    [id],
    (selectErr, equipamento) => {
      if (selectErr) {
        removerArquivoTermo(
          req.file.filename
        );

        return res.status(500).json({
          erro:
            "Erro ao localizar equipamento.",
        });
      }

      if (!equipamento) {
        removerArquivoTermo(
          req.file.filename
        );

        return res.status(404).json({
          erro:
            "Equipamento nao encontrado.",
        });
      }

      const termoAnterior =
        equipamento.termo_responsabilidade;

      db.run(
        `
        UPDATE equipamentos
        SET
          termo_responsabilidade = ?,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [
          req.file.filename,
          id,
        ],
        function (err) {
          if (err) {
            removerArquivoTermo(
              req.file.filename
            );

            return res.status(500).json({
              erro:
                "Erro ao salvar o termo.",
              detalhe: err.message,
            });
          }

          if (termoAnterior) {
            removerArquivoTermo(
              termoAnterior
            );
          }

          res.json({
            mensagem:
              "Termo de responsabilidade enviado com sucesso.",
            arquivo:
              req.file.filename,
            url:
              `/uploads/termos/${req.file.filename}`,
          });
        }
      );
    }
  );
};

// ==========================================
// EXCLUIR TERMO
// ==========================================
exports.excluirTermo = (req, res) => {
  const id = req.params.id;

  db.get(
    `
    SELECT termo_responsabilidade
    FROM equipamentos
    WHERE id = ?
    `,
    [id],
    (selectErr, equipamento) => {
      if (selectErr) {
        return res.status(500).json({
          erro:
            "Erro ao consultar equipamento.",
        });
      }

      if (!equipamento) {
        return res.status(404).json({
          erro:
            "Equipamento nao encontrado.",
        });
      }

      const arquivo =
        equipamento.termo_responsabilidade;

      db.run(
        `
        UPDATE equipamentos
        SET
          termo_responsabilidade = '',
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [id],
        function (err) {
          if (err) {
            return res.status(500).json({
              erro:
                "Erro ao excluir o termo.",
              detalhe: err.message,
            });
          }

          if (arquivo) {
            removerArquivoTermo(
              arquivo
            );
          }

          res.json({
            mensagem:
              "Termo removido com sucesso.",
          });
        }
      );
    }
  );
};

// ==========================================
// IMPORTAÇÃO EM MASSA
// ==========================================
exports.criarVarios = (req, res) => {
  const lista = Array.isArray(req.body)
    ? req.body
    : req.body.equipamentos;

  if (
    !Array.isArray(lista) ||
    lista.length === 0
  ) {
    return res.status(400).json({
      erro:
        "Nenhum equipamento informado.",
    });
  }

  const equipamentos =
    lista.map(normalizarEquipamento);

  const invalidos =
    equipamentos.filter(
      (equipamento) =>
        validar(equipamento)
    );

  if (invalidos.length > 0) {
    return res.status(400).json({
      erro:
        "Existem equipamentos sem nome ou patrimonio.",
      quantidade:
        invalidos.length,
      equipamentos:
        invalidos.map((equipamento) => ({
          nome:
            equipamento.nome,
          patrimonio:
            equipamento.patrimonio,
        })),
    });
  }

  const mapaPatrimonios =
    new Map();

  for (const equipamento of equipamentos) {
    const patrimonio =
      equipamento.patrimonio;

    if (
      !mapaPatrimonios.has(
        patrimonio
      )
    ) {
      mapaPatrimonios.set(
        patrimonio,
        []
      );
    }

    mapaPatrimonios
      .get(patrimonio)
      .push(equipamento);
  }

  const duplicados = [];

  for (
    const [patrimonio, itens]
    of mapaPatrimonios.entries()
  ) {
    if (itens.length > 1) {
      duplicados.push({
        patrimonio,
        quantidade:
          itens.length,
        equipamentos:
          itens.map((item) => ({
            nome: item.nome,
            patrimonio:
              item.patrimonio,
            categoria:
              item.categoria,
            localizacao:
              item.localizacao,
          })),
      });
    }
  }

  if (duplicados.length > 0) {
    return res.status(400).json({
      erro:
        "Existem patrimonios duplicados na importacao.",
      quantidadeDuplicados:
        duplicados.length,
      duplicados,
    });
  }

  db.serialize(() => {
    db.run(
      "BEGIN TRANSACTION",
      (beginErr) => {
        if (beginErr) {
          return res.status(500).json({
            erro:
              "Erro ao iniciar importacao.",
            detalhe:
              beginErr.message,
          });
        }

        const stmt =
          db.prepare(`
            INSERT INTO equipamentos
            (
              nome,
              categoria,
              patrimonio,
              status,
              localizacao,
              observacoes,
              usuario,
              setor_usuario,
              valor,
              anydesk,
              ultravnc,
              termo_responsabilidade,
              criado_por
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

        let concluidos = 0;
        let primeiroErro = null;

        for (
          const equipamento
          of equipamentos
        ) {
          stmt.run(
            [
              equipamento.nome,
              equipamento.categoria,
              equipamento.patrimonio,
              equipamento.status,
              equipamento.localizacao,
              equipamento.observacoes,
              equipamento.usuario,
              equipamento.setorUsuario,
              equipamento.valor,
              equipamento.anydesk,
              equipamento.ultravnc,
              equipamento.termoResponsabilidade,
              req.usuario?.id ||
                null,
            ],
            function (err) {
              if (
                err &&
                !primeiroErro
              ) {
                primeiroErro = err;
              }

              if (!err) {
                equipamento.id =
                  this.lastID;
              }

              concluidos++;

              if (
                concluidos ===
                equipamentos.length
              ) {
                finalizar();
              }
            }
          );
        }

        function finalizar() {
          stmt.finalize(
            (finalizeErr) => {
              if (
                primeiroErro ||
                finalizeErr
              ) {
                db.run(
                  "ROLLBACK",
                  () => {
                    const erroFinal =
                      primeiroErro ||
                      finalizeErr;

                    return res
                      .status(500)
                      .json({
                        erro:
                          "Erro ao importar equipamentos.",
                        detalhe:
                          erroFinal.message,
                      });
                  }
                );

                return;
              }

              db.run(
                "COMMIT",
                (commitErr) => {
                  if (commitErr) {
                    return res
                      .status(500)
                      .json({
                        erro:
                          "Erro ao concluir importacao.",
                        detalhe:
                          commitErr.message,
                      });
                  }

                  return res
                    .status(201)
                    .json({
                      mensagem:
                        `${equipamentos.length} equipamento(s) processado(s).`,
                      equipamentos,
                    });
                }
              );
            }
          );
        }
      }
    );
  });
};

// ==========================================
// FUNÇÃO AUXILIAR - REMOVER ARQUIVO
// ==========================================
function removerArquivoTermo(nomeArquivo) {
  if (!nomeArquivo) {
    return;
  }

  const caminho =
    path.join(
      __dirname,
      "..",
      "uploads",
      "termos",
      path.basename(nomeArquivo)
    );

  fs.unlink(
    caminho,
    (err) => {
      if (
        err &&
        err.code !== "ENOENT"
      ) {
        console.error(
          "Erro ao remover termo:",
          err.message
        );
      }
    }
  );
}