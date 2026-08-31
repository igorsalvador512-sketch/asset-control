const express = require("express");
const router = express.Router();

const impressorasController = require("../controllers/impressorasController");

// Listar impressoras
router.get("/", impressorasController.listar);

// Cadastrar impressora
router.post("/", impressorasController.criar);

// Atualizar impressora
router.put("/:id", impressorasController.atualizar);

// Excluir impressora
router.delete("/:id", impressorasController.excluir);

// Excluir todas
router.delete("/", impressorasController.excluirTodas);

module.exports = router;