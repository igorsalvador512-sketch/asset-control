const db = require("../database/database");

function normalizarEquipamento(body) {
  return {
    nome: String(body.nome || "").trim(),
    categoria: String(body.categoria || "").trim(),
    patrimonio: String(body.patrimonio || "").trim(),
    status: String(body.status || "ativo").trim(),
    localizacao: String(body.localizacao || "").trim(),
    observacoes: String(body.observacoes || "").trim(),
    usuario: String(body.usuario || "").trim(),
    setorUsuario: String(
      body.setorUsuario || body.setor_usuario || ""
    ).trim(),
    valor: Number(body.valor) || 0,
  };
}

function validar(equipamento) {
  if (!equipamento.nome || !equipamento.patrimonio) {
    return "Nome e Patrimonio sao obrigatorios.";
  }

  return null;
}

function mapear(row) {
  return {
    id: row.id,
    nome: row.nome,
    categoria: row.categoria || "",
    patrimonio: row.patrimonio,
    status: row.status || "ativo",
    localizacao: row.localizacao || "",
    observacoes: row.observacoes || "",
    usuario: row.usuario || "",
    setorUsuario: row.setor_usuario || "",
    valor: Number(row.valor) || 0,
  };
}


// ==========================================
// LISTAR EQUIPAMENTOS
// ==========================================
exports.listar = (req, res) => {
  db.all(
    `SELECT
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
      criado_por,
      criado_em,
      atualizado_em
    FROM equipamentos
    ORDER BY criado_em DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error("Erro ao listar equipamentos:", err);

        return res.status(500).json({
          erro: "Erro ao consultar equipamentos.",
          detalhe: err.message,
        });
      }

      res.json(rows.map(mapear));
    }
  );
};


// ==========================================
// CRIAR EQUIPAMENTO
// ==========================================
exports.criar = (req, res) => {
  const equipamento = normalizarEquipamento(req.body);

  const erro = validar(equipamento);

  if (erro) {
    return res.status(400).json({
      erro,
    });
  }

  /*
   * O ID NÃO é informado.
   * Como a tabela possui:
   *
   * id INTEGER PRIMARY KEY
   *
   * o SQLite gera automaticamente o ID.
   */
  db.run(
    `INSERT INTO equipamentos
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
        criado_por
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      req.usuario?.id || null,
    ],
    function (err) {
      if (err) {
        console.error("Erro ao cadastrar equipamento:", err);

        return res.status(500).json({
          erro: "Erro ao cadastrar equipamento.",
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
// ATUALIZAR EQUIPAMENTO
// ==========================================
exports.atualizar = (req, res) => {
  const equipamento = normalizarEquipamento(req.body);

  const erro = validar(equipamento);

  if (erro) {
    return res.status(400).json({
      erro,
    });
  }

  db.run(
    `UPDATE equipamentos
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
       atualizado_em = CURRENT_TIMESTAMP
     WHERE id = ?`,
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
      req.params.id,
    ],
    function (err) {
      if (err) {
        console.error("Erro ao atualizar equipamento:", err);

        return res.status(500).json({
          erro: "Erro ao atualizar equipamento.",
          detalhe: err.message,
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          erro: "Equipamento nao encontrado.",
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
// EXCLUIR EQUIPAMENTO
// ==========================================
exports.excluir = (req, res) => {
  db.run(
    "DELETE FROM equipamentos WHERE id = ?",
    [req.params.id],
    function (err) {
      if (err) {
        console.error("Erro ao excluir equipamento:", err);

        return res.status(500).json({
          erro: "Erro ao excluir equipamento.",
          detalhe: err.message,
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          erro: "Equipamento nao encontrado.",
        });
      }

      res.json({
        mensagem: "Equipamento excluido com sucesso.",
      });
    }
  );
};


// ==========================================
// EXCLUIR TODOS OS EQUIPAMENTOS
// ==========================================
exports.excluirTodos = (req, res) => {
  db.run(
    "DELETE FROM equipamentos",
    [],
    function (err) {
      if (err) {
        console.error("Erro ao excluir equipamentos:", err);

        return res.status(500).json({
          erro: "Erro ao excluir equipamentos.",
          detalhe: err.message,
        });
      }

      res.json({
        mensagem: `${this.changes} equipamento(s) excluido(s).`,
      });
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

  // ------------------------------------------
  // VALIDAR LISTA
  // ------------------------------------------
  if (!Array.isArray(lista) || lista.length === 0) {
    return res.status(400).json({
      erro: "Nenhum equipamento informado.",
    });
  }

  // ------------------------------------------
  // NORMALIZAR
  // ------------------------------------------
  const equipamentos = lista.map(normalizarEquipamento);

  // ------------------------------------------
  // VALIDAR CAMPOS OBRIGATORIOS
  // ------------------------------------------
  const invalidos = equipamentos.filter(
    (equipamento) => validar(equipamento)
  );

  if (invalidos.length > 0) {
    return res.status(400).json({
      erro: "Existem equipamentos sem nome ou patrimonio.",
      quantidade: invalidos.length,
      equipamentos: invalidos.map((equipamento) => ({
        nome: equipamento.nome,
        patrimonio: equipamento.patrimonio,
      })),
    });
  }

  // ------------------------------------------
  // VERIFICAR PATRIMONIOS DUPLICADOS
  // ------------------------------------------
  const mapaPatrimonios = new Map();

  for (const equipamento of equipamentos) {
    const patrimonio = equipamento.patrimonio;

    if (!mapaPatrimonios.has(patrimonio)) {
      mapaPatrimonios.set(patrimonio, []);
    }

    mapaPatrimonios.get(patrimonio).push(equipamento);
  }

  const duplicados = [];

  for (const [patrimonio, itens] of mapaPatrimonios.entries()) {
    if (itens.length > 1) {
      duplicados.push({
        patrimonio,
        quantidade: itens.length,
        equipamentos: itens.map((item) => ({
          nome: item.nome,
          patrimonio: item.patrimonio,
          categoria: item.categoria,
          localizacao: item.localizacao,
        })),
      });
    }
  }

  // ------------------------------------------
  // SE HOUVER DUPLICADOS, NÃO IMPORTAR NADA
  // ------------------------------------------
  if (duplicados.length > 0) {
    console.error(
      "PATRIMONIOS DUPLICADOS ENCONTRADOS:"
    );

    console.error(
      JSON.stringify(duplicados, null, 2)
    );

    return res.status(400).json({
      erro: "Existem patrimonios duplicados na importacao.",
      quantidadeDuplicados: duplicados.length,
      duplicados,
    });
  }

  // ------------------------------------------
  // INICIAR TRANSAÇÃO
  // ------------------------------------------
  db.serialize(() => {
    db.run(
      "BEGIN TRANSACTION",
      (beginErr) => {
        if (beginErr) {
          console.error(
            "Erro ao iniciar transacao:",
            beginErr
          );

          return res.status(500).json({
            erro: "Erro ao iniciar importacao.",
            detalhe: beginErr.message,
          });
        }

        // --------------------------------------
        // PREPARAR INSERT
        // --------------------------------------
        const stmt = db.prepare(`
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
            criado_por
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        let concluidos = 0;
        let primeiroErro = null;

        // --------------------------------------
        // INSERIR EQUIPAMENTOS
        // --------------------------------------
        for (const equipamento of equipamentos) {
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
              req.usuario?.id || null,
            ],
            function (err) {
              if (err && !primeiroErro) {
                primeiroErro = err;
              }

              // O SQLite gera o ID automaticamente
              if (!err) {
                equipamento.id = this.lastID;
              }

              concluidos++;

              if (
                concluidos === equipamentos.length
              ) {
                finalizar();
              }
            }
          );
        }

        // --------------------------------------
        // FINALIZAR IMPORTAÇÃO
        // --------------------------------------
        function finalizar() {
          stmt.finalize((finalizeErr) => {
            if (primeiroErro || finalizeErr) {
              db.run(
                "ROLLBACK",
                () => {
                  const erroFinal =
                    primeiroErro ||
                    finalizeErr;

                  console.error(
                    "Erro na importacao:",
                    erroFinal
                  );

                  return res.status(500).json({
                    erro: "Erro ao importar equipamentos.",
                    detalhe: erroFinal.message,
                  });
                }
              );

              return;
            }

            // ----------------------------------
            // COMMIT
            // ----------------------------------
            db.run(
              "COMMIT",
              (commitErr) => {
                if (commitErr) {
                  console.error(
                    "Erro ao concluir importacao:",
                    commitErr
                  );

                  return res.status(500).json({
                    erro: "Erro ao concluir importacao.",
                    detalhe: commitErr.message,
                  });
                }

                console.log(
                  `${equipamentos.length} equipamentos importados com sucesso.`
                );

                return res.status(201).json({
                  mensagem:
                    `${equipamentos.length} equipamento(s) processado(s).`,
                  equipamentos,
                });
              }
            );
          });
        }
      }
    );
  });
};