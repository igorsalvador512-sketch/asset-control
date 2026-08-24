require("dotenv").config();

const express = require("express");
const cors = require("cors");

require("./database/database");

const authRoutes = require("./routes/auth");
const equipamentosRoutes = require("./routes/equipamentos");

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors({ origin: true }));
app.use(express.json({ limit: "5mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/equipamentos", equipamentosRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "online",
    mensagem: "Backend do Asset Control funcionando!",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
