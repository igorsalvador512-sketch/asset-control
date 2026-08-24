const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const controller = require("../controllers/equipamentosController");

router.use(auth);

router.get("/", controller.listar);
router.post("/", controller.criar);
router.post("/bulk", controller.criarVarios);
router.put("/:id", controller.atualizar);
router.delete("/", controller.excluirTodos);
router.delete("/:id", controller.excluir);

module.exports = router;
