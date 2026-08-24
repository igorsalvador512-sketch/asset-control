const express = require("express");
const router = express.Router();
const equipmentController = require("../controllers/equipmentController");
const authMiddleware = require("../middleware/authMiddleware");

// Exige que o usuário esteja logado para acessar os equipamentos
router.use(authMiddleware);

router.get("/", equipmentController.listar);
router.post("/", equipmentController.criar);
router.delete("/:id", equipmentController.deletar);

module.exports = router;