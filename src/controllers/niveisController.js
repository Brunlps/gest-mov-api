const PRISMA = require("../services");

async function buscar(req, res) {
    try {
        const linhas = await PRISMA.niveis.findMany;
        res.json(linhas)
    } catch (error) {
        res.json({
            type: "error",
            decription: error.message
        });
    }
}

module.exports = {
    buscar
}