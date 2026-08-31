const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "asset-control.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco:", err.message);
    return;
  }

  console.log("Banco SQLite conectado.");

  inicializarBanco();
});

function inicializarBanco() {
  db.serialize(() => {
    // ==============================
    // TABELA DE USUARIOS
    // ==============================
    db.run(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ==============================
    // TABELA DE EQUIPAMENTOS
    // ==============================
    db.run(
      `
      CREATE TABLE IF NOT EXISTS equipamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        categoria TEXT DEFAULT '',
        patrimonio TEXT NOT NULL,
        status TEXT DEFAULT 'ativo',
        localizacao TEXT DEFAULT '',
        observacoes TEXT DEFAULT '',
        usuario TEXT DEFAULT '',
        setor_usuario TEXT DEFAULT '',
        valor REAL NOT NULL DEFAULT 0,
        anydesk TEXT DEFAULT '',
        ultravnc TEXT DEFAULT '',
        termo_responsabilidade TEXT DEFAULT '',
        criado_por INTEGER,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (criado_por) REFERENCES usuarios(id)
      )
    `,
      (err) => {
        if (err) {
          console.error(
            "Erro ao criar tabela equipamentos:",
            err.message
          );
          return;
        }

        verificarColunasEquipamentos();
      }
    );

    // ==============================
    // TABELA DE IMPRESSORAS
    // ==============================
    criarTabelaImpressoras();
  });
}

// ==========================================
// MIGRAÇÃO DA TABELA EQUIPAMENTOS
// ==========================================
function verificarColunasEquipamentos() {
  db.all(
    "PRAGMA table_info(equipamentos)",
    [],
    (err, colunas) => {
      if (err) {
        console.error(
          "Erro ao verificar estrutura:",
          err.message
        );
        return;
      }

      const nomesColunas = colunas.map(
        (coluna) => coluna.name
      );

      console.log(
        "Colunas atuais:",
        nomesColunas.join(", ")
      );

      const adicionarColuna = (
        nome,
        definicao,
        callback
      ) => {
        if (nomesColunas.includes(nome)) {
          callback();
          return;
        }

        console.log(
          `Adicionando coluna: ${nome}`
        );

        db.run(
          `ALTER TABLE equipamentos ADD COLUMN ${nome} ${definicao}`,
          (erro) => {
            if (erro) {
              console.error(
                `Erro ao adicionar coluna ${nome}:`,
                erro.message
              );
            } else {
              console.log(
                `Coluna ${nome} adicionada com sucesso.`
              );
            }

            callback();
          }
        );
      };

      adicionarColuna(
        "categoria",
        "TEXT DEFAULT ''",
        () => {
          adicionarColuna(
            "status",
            "TEXT DEFAULT 'ativo'",
            () => {
              adicionarColuna(
                "localizacao",
                "TEXT DEFAULT ''",
                () => {
                  adicionarColuna(
                    "observacoes",
                    "TEXT DEFAULT ''",
                    () => {
                      adicionarColuna(
                        "usuario",
                        "TEXT DEFAULT ''",
                        () => {
                          adicionarColuna(
                            "setor_usuario",
                            "TEXT DEFAULT ''",
                            () => {
                              adicionarColuna(
                                "valor",
                                "REAL DEFAULT 0",
                                () => {
                                  adicionarColuna(
                                    "criado_por",
                                    "INTEGER",
                                    () => {
                                      adicionarColuna(
                                        "criado_em",
                                        "DATETIME DEFAULT CURRENT_TIMESTAMP",
                                        () => {
                                          adicionarColuna(
                                            "atualizado_em",
                                            "DATETIME DEFAULT CURRENT_TIMESTAMP",
                                            () => {
                                              adicionarColuna(
                                                "anydesk",
                                                "TEXT DEFAULT ''",
                                                () => {
                                                  adicionarColuna(
                                                    "ultravnc",
                                                    "TEXT DEFAULT ''",
                                                    () => {
                                                      adicionarColuna(
                                                        "termo_responsabilidade",
                                                        "TEXT DEFAULT ''",
                                                        () => {
                                                          criarIndicesEquipamentos();
                                                        }
                                                      );
                                                    }
                                                  );
                                                }
                                              );
                                            }
                                          );
                                        }
                                      );
                                    }
                                  );
                                }
                              );
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
}

// ==========================================
// INDICES DOS EQUIPAMENTOS
// ==========================================
function criarIndicesEquipamentos() {
  db.run(
    `
    CREATE INDEX IF NOT EXISTS idx_equipamentos_patrimonio
    ON equipamentos(patrimonio)
    `,
    (err) => {
      if (err) {
        console.error(
          "Erro no índice de patrimônio:",
          err.message
        );
      }

      db.run(
        `
        CREATE INDEX IF NOT EXISTS idx_equipamentos_local
        ON equipamentos(localizacao)
        `,
        (err) => {
          if (err) {
            console.error(
              "Erro no índice de local:",
              err.message
            );
          } else {
            console.log(
              "Estrutura dos equipamentos verificada com sucesso."
            );
          }
        }
      );
    }
  );
}

// ==========================================
// TABELA DE IMPRESSORAS
// ==========================================
function criarTabelaImpressoras() {
  db.run(
    `
    CREATE TABLE IF NOT EXISTS impressoras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patrimonio TEXT NOT NULL,
      ip TEXT DEFAULT '',
      local TEXT DEFAULT '',
      tipo TEXT DEFAULT '',
      marca TEXT DEFAULT '',
      modelo TEXT DEFAULT '',
      situacao TEXT NOT NULL DEFAULT 'Funcionando',
      preco REAL NOT NULL DEFAULT 0,
      observacao TEXT DEFAULT '',
      criado_por INTEGER,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (criado_por) REFERENCES usuarios(id)
    )
    `,
    (err) => {
      if (err) {
        console.error(
          "Erro ao criar tabela impressoras:",
          err.message
        );
        return;
      }

      console.log(
        "Tabela de impressoras verificada com sucesso."
      );

      db.run(
        `
        CREATE INDEX IF NOT EXISTS idx_impressoras_patrimonio
        ON impressoras(patrimonio)
        `,
        (indexErr) => {
          if (indexErr) {
            console.error(
              "Erro no índice de patrimônio das impressoras:",
              indexErr.message
            );
          } else {
            console.log(
              "Estrutura das impressoras verificada com sucesso."
            );
          }
        }
      );
    }
  );
}

module.exports = db;