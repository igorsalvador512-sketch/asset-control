const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../database/database");

// Cadastro
exports.register = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({
      erro: "Preencha todos os campos."
    });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10);

    db.run(
      "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
      [nome, email, senhaHash],
      function (err) {
        if (err) {
          return res.status(400).json({
            erro: "Este e-mail já está cadastrado."
          });
        }

        res.status(201).json({
          mensagem: "Conta criada com sucesso!"
        });
      }
    );
  } catch (erro) {
    res.status(500).json({
      erro: "Erro interno do servidor."
    });
  }
};

// Login
exports.login = (req, res) => {
  const { email, senha } = req.body;

  db.get(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    async (err, usuario) => {
      if (err) {
        return res.status(500).json({
          erro: "Erro interno."
        });
      }

      if (!usuario) {
        return res.status(401).json({
          erro: "E-mail ou senha inválidos."
        });
      }

      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

      if (!senhaCorreta) {
        return res.status(401).json({
          erro: "E-mail ou senha inválidos."
        });
      }

      const token = jwt.sign(
        {
          id: usuario.id,
          nome: usuario.nome
        },
        "assetcontrol123",
        {
          expiresIn: "8h"
        }
      );

      res.json({
        mensagem: "Login realizado com sucesso!",
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email
        }
      });
    }
  );
};