require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

require("./database/database");

const authRoutes = require("./routes/auth");
const equipamentosRoutes = require("./routes/equipamentos");
const impressorasRoutes = require("./routes/impressoras");

const app = express();

const PORT =
  Number(process.env.PORT) || 3001;

// ==========================================
// CORS
// ==========================================

app.use(
  cors({
    origin: true,
  })
);

// ==========================================
// JSON
// ==========================================

app.use(
  express.json({
    limit: "5mb",
  })
);

// ==========================================
// ARQUIVOS ESTÁTICOS
// ==========================================

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "uploads"
    )
  )
);

// ==========================================
// ROTAS
// ==========================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/equipamentos",
  equipamentosRoutes
);

app.use(
  "/api/impressoras",
  impressorasRoutes
);

// ==========================================
// TESTE
// ==========================================

app.get("/", (req, res) => {
  res.json({
    status: "online",
    mensagem:
      "Backend do Asset Control funcionando!",
  });
});

// ==========================================
// SERVIDOR
// ==========================================

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `Servidor rodando na porta ${PORT}`
    );
  }
);