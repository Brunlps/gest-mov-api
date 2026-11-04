const express = require("express");
const cors = require("cors");
const niveisRoutes = require("./src/routes/niveisRoutes");
const imoveis_tipo = require("./src/routes/imoveisTipoRoutes");
const usuarios = require("./src/routes/usuariosRoutes");
const { login } = require("./src/controllers/usuariosController");

const app = express();

app.use(cors()); //permite que requisições externas acessem as rotas
app.use(express.json()); //transforma o JSON do corpo da requisição em JS

app.get("/", (req, res) => {
    res.send("Olá mundo");
});

app.post("/login", login);

app.use("/niveis", niveisRoutes);
app.use("/imoveis-tipo", imoveis_tipo);
app.use("/usuarios", usuarios);

app.listen(3000, () => {
    console.log("Servidor on: http://localhost:3000");
});