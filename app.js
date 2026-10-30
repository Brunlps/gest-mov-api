const express = require("express");
const cors = require("cors");
const niveisController = require("./src/routes/niveisRoutes");

const app = express();

app.use(cors()); // permite que o requisições esternos acessem as rotas
app.use(express.json()); // transforma o JSON do corpo da requisiçao em js

app.get("/", (req, res) =>{
    res.send("Olá Tapioca")
});

app.use("/niveis", niveisController); //middleare

app.listen(3000, () => {
    console.log("Servidor on: http://localhost:3000");
});