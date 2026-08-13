const express = require("express");
const cors = require("cors");

require("./database/database");

const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "online",
    mensagem: "Backend do Asset Control funcionando!"
  });
});

const PORT = 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});