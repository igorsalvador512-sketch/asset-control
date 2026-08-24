const db = require("../database/database");

function gerarId() {
  return Date.now() + Math.floor(Math.random() * 100000);
}

function normalizarEquipamento(body, id) {
  let idFinal;

  // Se o ID recebido for numérico, podemos reaproveitá-lo.
  // Caso seja texto, geramos um ID numérico compatível
  // com bancos antigos que usam INTEGER PRIMARY KEY.
  if (id !== undefined && id !== null && id !== "") {
    const numero = Number(id);

    if (Number.isInteger(numero) && numero > 0) {
      idFinal = numero;
    } else {
      idFinal = gerarId();
    }
  } else {
    idFinal = gerarId();
  }

  return {
    id: idFinal,
    nome: String(body.nome || "").trim(),
    patrimonio: String(body.patrimonio || "").trim(),
    usuario: String(body.usuario || "").trim(),
    setorUsuario: String(
      body.setorUsuario ||
      body.setor_usuario ||
      ""
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
    patrimonio: row.patrimonio,
    usuario: row.usuario || "",
    setorUsuario: row.setor_usuario || "",
    valor: Number(row.valor) || 0,
  };
}


// ==========================================
// LISTAR
// ==========================================
exports.listar = (req, res) => {
  db.all(
    `SELECT
       id,
       nome,
       patrimonio,
       usuario,
       setor_usuario,
       valor
     FROM equipamentos
     ORDER BY criado_em DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error("Erro ao listar equipamentos:", err);

        return res.status(500).json({
          erro: "Erro ao consultar equipamentos."
        });
      }

      res.json(rows.map(mapear));
    }
  );
};


// ==========================================
// CRIAR
// ==========================================
exports.criar = (req, res) => {
  const equipamento = normalizarEquipamento(req.body);

  const erro = validar(equipamento);

  if (erro) {
    return res.status(400).json({ erro });
  }

  db.run(
    `INSERT INTO equipamentos
      (
        id,
        nome,
        patrimonio,
        usuario,
        setor_usuario,
        valor,
        criado_por
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      equipamento.id,
      equipamento.nome,
      equipamento.patrimonio,
      equipamento.usuario,
      equipamento.setorUsuario,
      equipamento.valor,
      req.usuario?.id || null,
    ],
    function (err) {
      if (err) {
        console.error("Erro ao cadastrar equipamento:", err);

        return res.status(500).json({
          erro: "Erro ao cadastrar equipamento."
        });
      }

      res.status(201).json(equipamento);
    }
  );
};


// ==========================================
// ATUALIZAR
// ==========================================
exports.atualizar = (req, res) => {
  const equipamento = normalizarEquipamento(
    req.body,
    req.params.id
  );

  const erro = validar(equipamento);

  if (erro) {
    return res.status(400).json({ erro });
  }

  db.run(
    `UPDATE equipamentos
     SET
       nome = ?,
       patrimonio = ?,
       usuario = ?,
       setor_usuario = ?,
       valor = ?,
       atualizado_em = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      equipamento.nome,
      equipamento.patrimonio,
      equipamento.usuario,
      equipamento.setorUsuario,
      equipamento.valor,
      req.params.id,
    ],
    function (err) {
      if (err) {
        console.error("Erro ao atualizar equipamento:", err);

        return res.status(500).json({
          erro: "Erro ao atualizar equipamento."
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          erro: "Equipamento nao encontrado."
        });
      }

      res.json({
        ...equipamento,
        id: Number(req.params.id)
      });
    }
  );
};


// ==========================================
// EXCLUIR
// ==========================================
exports.excluir = (req, res) => {
  db.run(
    "DELETE FROM equipamentos WHERE id = ?",
    [req.params.id],
    function (err) {
      if (err) {
        console.error("Erro ao excluir equipamento:", err);

        return res.status(500).json({
          erro: "Erro ao excluir equipamento."
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          erro: "Equipamento nao encontrado."
        });
      }

      res.json({
        mensagem: "Equipamento excluido com sucesso."
      });
    }
  );
};


// ==========================================
// EXCLUIR TODOS
// ==========================================
exports.excluirTodos = (req, res) => {
  db.run(
    "DELETE FROM equipamentos",
    [],
    function (err) {
      if (err) {
        console.error("Erro ao excluir equipamentos:", err);

        return res.status(500).json({
          erro: "Erro ao excluir equipamentos."
        });
      }

      res.json({
        mensagem: `${this.changes} equipamento(s) excluido(s).`
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

  if (!Array.isArray(lista) || lista.length === 0) {
    return res.status(400).json({
      erro: "Nenhum equipamento informado."
    });
  }

  const equipamentos = lista.map((item) =>
    normalizarEquipamento(item, item.id)
  );

  const invalido = equipamentos.find(
    (item) => validar(item)
  );

  if (invalido) {
    return res.status(400).json({
      erro: "Todos os equipamentos precisam ter nome e patrimonio.",
      patrimonio: invalido.patrimonio
    });
  }

  db.serialize(() => {

    db.run("BEGIN TRANSACTION", (beginErr) => {
      if (beginErr) {
        console.error(
          "Erro ao iniciar transacao:",
          beginErr
        );

        return res.status(500).json({
          erro: "Erro ao iniciar importacao."
        });
      }

      const stmt = db.prepare(`
        INSERT INTO equipamentos
        (
          id,
          nome,
          patrimonio,
          usuario,
          setor_usuario,
          valor,
          criado_por,
          atualizado_em
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      let erro = null;
      let concluidos = 0;

      equipamentos.forEach((equipamento) => {
        stmt.run(
          [
            equipamento.id,
            equipamento.nome,
            equipamento.patrimonio,
            equipamento.usuario,
            equipamento.setorUsuario,
            equipamento.valor,
            req.usuario?.id || null
          ],
          (err) => {
            if (err && !erro) {
              erro = err;
            }

            concluidos++;

            if (concluidos === equipamentos.length) {
              finalizarImportacao();
            }
          }
        );
      });

      function finalizarImportacao() {
        stmt.finalize((finalizeErr) => {

          if (erro || finalizeErr) {
            db.run("ROLLBACK", () => {
              console.error(
                "Erro na importacao:",
                erro || finalizeErr
              );

              return res.status(500).json({
                erro: "Erro ao importar equipamentos.",
                detalhe: (erro || finalizeErr).message
              });
            });

            return;
          }

          db.run("COMMIT", (commitErr) => {
            if (commitErr) {
              console.error(
                "Erro ao concluir importacao:",
                commitErr
              );

              return res.status(500).json({
                erro: "Erro ao concluir importacao."
              });
            }

            console.log(
              `${equipamentos.length} equipamentos importados com sucesso.`
            );

            return res.status(201).json({
              mensagem:
                `${equipamentos.length} equipamento(s) processado(s).`,
              equipamentos
            });
          });
        });
      }
    });
  });
};