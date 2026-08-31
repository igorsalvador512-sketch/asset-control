const db = require("../database/database");

// ==========================================
// NORMALIZAR IMPRESSORA
// ==========================================
function normalizarImpressora(body) {
  return {
    patrimonio: String(body.patrimonio || "").trim(),
    ip: String(body.ip || "").trim(),
    local: String(body.local || "").trim(),
    tipo: String(body.tipo || "").trim(),
    marca: String(body.marca || "").trim(),
    modelo: String(body.modelo || "").trim(),
    situacao: String(body.situacao || "Funcionando").trim(),
    preco: Number(body.preco) || 0,
    observacao: String(body.observacao || "").trim(),
  };
}


// ==========================================
// VALIDAR IMPRESSORA
// ==========================================
function validar(impressora) {
  if (!impressora.patrimonio) {
    return "Patrimonio e obrigatorio.";
  }

  const situacoesValidas = [
  "Funcionando",
  "Em manutenção",
  "Parada",
  "Inativa",
];

  if (!situacoesValidas.includes(impressora.situacao)) {
    return "Situacao invalida.";
  }

  return null;
}


// ==========================================
// MAPEAR REGISTRO
// ==========================================
function mapear(row) {
  return {
    id: row.id,
    patrimonio: row.patrimonio,
    ip: row.ip || "",
    local: row.local || "",
    tipo: row.tipo || "",
    marca: row.marca || "",
    modelo: row.modelo || "",
    situacao: row.situacao || "Funcionando",
    preco: Number(row.preco) || 0,
    observacao: row.observacao || "",
    criado_por: row.criado_por || null,
    criado_em: row.criado_em || null,
    atualizado_em: row.atualizado_em || null,
  };
}


// ==========================================
// LISTAR IMPRESSORAS
// ==========================================
exports.listar = (req, res) => {
  db.all(
    `SELECT
      id,
      patrimonio,
      ip,
      local,
      tipo,
      marca,
      modelo,
      situacao,
      preco,
      observacao,
      criado_por,
      criado_em,
      atualizado_em
    FROM impressoras
    ORDER BY criado_em DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error("Erro ao listar impressoras:", err.message);

        return res.status(500).json({
          erro: "Erro ao consultar impressoras.",
          detalhe: err.message,
        });
      }

      res.json(rows.map(mapear));
    }
  );
};


// ==========================================
// CRIAR IMPRESSORA
// ==========================================
exports.criar = (req, res) => {
  const impressora = normalizarImpressora(req.body);

  const erro = validar(impressora);

  if (erro) {
    return res.status(400).json({
      erro,
    });
  }

  db.run(
    `INSERT INTO impressoras
      (
        patrimonio,
        ip,
        local,
        tipo,
        marca,
        modelo,
        situacao,
        preco,
        observacao,
        criado_por
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      impressora.patrimonio,
      impressora.ip,
      impressora.local,
      impressora.tipo,
      impressora.marca,
      impressora.modelo,
      impressora.situacao,
      impressora.preco,
      impressora.observacao,
      req.usuario?.id || null,
    ],
    function (err) {
      if (err) {
        console.error("Erro ao cadastrar impressora:", err.message);

        return res.status(500).json({
          erro: "Erro ao cadastrar impressora.",
          detalhe: err.message,
        });
      }

      res.status(201).json({
        id: this.lastID,
        ...impressora,
      });
    }
  );
};


// ==========================================
// ATUALIZAR IMPRESSORA
// ==========================================
exports.atualizar = (req, res) => {
  const impressora = normalizarImpressora(req.body);

  const erro = validar(impressora);

  if (erro) {
    return res.status(400).json({
      erro,
    });
  }

  db.run(
    `UPDATE impressoras
     SET
       patrimonio = ?,
       ip = ?,
       local = ?,
       tipo = ?,
       marca = ?,
       modelo = ?,
       situacao = ?,
       preco = ?,
       observacao = ?,
       atualizado_em = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      impressora.patrimonio,
      impressora.ip,
      impressora.local,
      impressora.tipo,
      impressora.marca,
      impressora.modelo,
      impressora.situacao,
      impressora.preco,
      impressora.observacao,
      req.params.id,
    ],
    function (err) {
      if (err) {
        console.error("Erro ao atualizar impressora:", err.message);

        return res.status(500).json({
          erro: "Erro ao atualizar impressora.",
          detalhe: err.message,
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          erro: "Impressora nao encontrada.",
        });
      }

      res.json({
        id: Number(req.params.id),
        ...impressora,
      });
    }
  );
};


// ==========================================
// EXCLUIR IMPRESSORA
// ==========================================
exports.excluir = (req, res) => {
  db.run(
    "DELETE FROM impressoras WHERE id = ?",
    [req.params.id],
    function (err) {
      if (err) {
        console.error("Erro ao excluir impressora:", err.message);

        return res.status(500).json({
          erro: "Erro ao excluir impressora.",
          detalhe: err.message,
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          erro: "Impressora nao encontrada.",
        });
      }

      res.json({
        mensagem: "Impressora excluida com sucesso.",
      });
    }
  );
};


// ==========================================
// EXCLUIR TODAS AS IMPRESSORAS
// ==========================================
exports.excluirTodas = (req, res) => {
  db.run(
    "DELETE FROM impressoras",
    [],
    function (err) {
      if (err) {
        console.error("Erro ao excluir impressoras:", err.message);

        return res.status(500).json({
          erro: "Erro ao excluir impressoras.",
          detalhe: err.message,
        });
      }

      res.json({
        mensagem: `${this.changes} impressora(s) excluida(s).`,
      });
    }
  );
};