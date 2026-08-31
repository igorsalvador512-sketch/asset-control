const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const auth = require("../middleware/auth");
const controller = require("../controllers/equipamentosController");

// ==========================================
// GARANTIR PASTA DOS TERMOS
// ==========================================

const pastaTermos = path.join(
  __dirname,
  "..",
  "uploads",
  "termos"
);

if (!fs.existsSync(pastaTermos)) {
  fs.mkdirSync(pastaTermos, {
    recursive: true,
  });
}

// ==========================================
// CONFIGURAÇÃO DO UPLOAD
// ==========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pastaTermos);
  },

  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname);

    const nomeArquivo =
      `termo-${req.params.id}-${Date.now()}${extensao}`;

    cb(null, nomeArquivo);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const extensao = path
      .extname(file.originalname)
      .toLowerCase();

    const permitidos = [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".pdf",
    ];

    if (!permitidos.includes(extensao)) {
      return cb(
        new Error(
          "Formato inválido. Envie JPG, JPEG, PNG, WEBP ou PDF."
        )
      );
    }

    cb(null, true);
  },
});

// ==========================================
// AUTENTICAÇÃO
// ==========================================

router.use(auth);

// ==========================================
// EQUIPAMENTOS
// ==========================================

router.get(
  "/",
  controller.listar
);

router.post(
  "/",
  controller.criar
);

router.post(
  "/bulk",
  controller.criarVarios
);

router.put(
  "/:id",
  controller.atualizar
);

router.delete(
  "/",
  controller.excluirTodos
);

router.delete(
  "/:id",
  controller.excluir
);

// ==========================================
// TERMO DE RESPONSABILIDADE
// ==========================================

router.post(
  "/:id/termo",
  upload.single("termo"),
  controller.uploadTermo
);

router.delete(
  "/:id/termo",
  controller.excluirTermo
);

// ==========================================
// EXPORTAR ROUTER
// ==========================================

module.exports = router;