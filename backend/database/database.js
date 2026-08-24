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
    db.run(`
      CREATE TABLE IF NOT EXISTS equipamentos (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        patrimonio TEXT NOT NULL,
        usuario TEXT DEFAULT '',
        setor_usuario TEXT DEFAULT '',
        valor REAL NOT NULL DEFAULT 0,
        criado_por INTEGER,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (criado_por) REFERENCES usuarios(id)
      )
    `, (err) => {
      if (err) {
        console.error("Erro ao criar tabela equipamentos:", err.message);
        return;
      }

      verificarColunasEquipamentos();
    });
  });
}


// ==========================================
// MIGRAÇÃO DA TABELA EQUIPAMENTOS
// ==========================================
function verificarColunasEquipamentos() {
  db.all("PRAGMA table_info(equipamentos)", [], (err, colunas) => {
    if (err) {
      console.error("Erro ao verificar estrutura:", err.message);
      return;
    }

    const nomesColunas = colunas.map((coluna) => coluna.name);

    console.log("Colunas atuais:", nomesColunas.join(", "));

    const adicionarColuna = (nome, definicao, callback) => {
      if (nomesColunas.includes(nome)) {
        callback();
        return;
      }

      console.log(`Adicionando coluna: ${nome}`);

      db.run(
        `ALTER TABLE equipamentos ADD COLUMN ${nome} ${definicao}`,
        (erro) => {
          if (erro) {
            console.error(
              `Erro ao adicionar coluna ${nome}:`,
              erro.message
            );
          } else {
            console.log(`Coluna ${nome} adicionada com sucesso.`);
          }

          callback();
        }
      );
    };

    // Faz as alterações uma por uma
    adicionarColuna("usuario", "TEXT DEFAULT ''", () => {
      adicionarColuna("setor_usuario", "TEXT DEFAULT ''", () => {
        adicionarColuna("valor", "REAL DEFAULT 0", () => {
          adicionarColuna("criado_por", "INTEGER", () => {
            adicionarColuna(
              "criado_em",
              "DATETIME DEFAULT CURRENT_TIMESTAMP",
              () => {
                adicionarColuna(
                  "atualizado_em",
                  "DATETIME DEFAULT CURRENT_TIMESTAMP",
                  () => {
                    criarIndices();
                  }
                );
              }
            );
          });
        });
      });
    });
  });
}


// ==========================================
// INDICES
// ==========================================
function criarIndices() {
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_equipamentos_patrimonio
     ON equipamentos(patrimonio)`,
    (err) => {
      if (err) {
        console.error(
          "Erro no índice de patrimônio:",
          err.message
        );
      }

      db.run(
        `CREATE INDEX IF NOT EXISTS idx_equipamentos_setor
         ON equipamentos(setor_usuario)`,
        (err) => {
          if (err) {
            console.error(
              "Erro no índice de setor:",
              err.message
            );
          } else {
            console.log("Estrutura do banco verificada com sucesso.");
          }
        }
      );
    }
  );
}

module.exports = db;