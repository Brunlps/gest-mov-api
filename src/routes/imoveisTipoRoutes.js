const { buscar, criar, editar, deletar } = require("../controllers/imoveisTipoController");
const { validadorDados } = require("../middlewares/imoveisTipoMiddlewares");

const rotas = require("express").Router();

rotas.get("/", buscar);
rotas.post("/", validadorDados, criar);
rotas.put("/:id", validadorDados, editar);
rotas.delete("/:id", deletar);


module.exports = rotas;