const { buscar, criar, editar, deletar } = require("../controllers/usuariosController");
const { usuariosAutenticado } = require("../middlewares/usuariosAutenticado");

const rotas = require("express").Router();

rotas
rotas.get("/", usuariosAutenticado, buscar);
rotas.post("/", criar);
rotas.put("/:id", editar);
rotas.delete("/:id", deletar);

module.exports = rotas;
