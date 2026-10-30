const { buscar } = require("../controllers/niveisController")

const rotas = require("express").Router();

rotas.get("/", buscar);

module.exports = rotas;