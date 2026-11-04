const PRISMA = require("../services");

async function buscar(req, res) {
    try {
        const linhas = await PRISMA.imoveis_tipo.findMany();

        res.json(linhas)

    } catch (error) {
        res.json({
            type: "error",
            description: error.message
        });
    }
}

async function criar(req, res) {
    try {
        const { nome } = req.body;

        await PRISMA.imoveis_tipo.create({
            data: {
                nome
            }
        });

        res.json({
            type: "success",
            description: "Registro criado com sucesso"
        })

    } catch (error) {
        res.json({
            type: "error",
            description: error.message
        });
    }
}

async function editar(req, res) {
    try {
        const { id } = req.params
        const dados = req.body;

        const resposta = await PRISMA.imoveis_tipo.update({
            data: dados,
            where: {
                id
            }
        });

        res.json({
            type: "success",
            description: "Registro atualizado com sucesso"
        })

    } catch (error) {
        res.json({
            type: "error",
            description: error.message
        });
    }
}

async function deletar(req, res) {
    try {
        const { id } = req.params

        const resposta = await PRISMA.imoveis_tipo.delete({
            where: {
                id
            }
        });

        res.json({
            type: "success",
            description: "Registro deletado com sucesso"
        })

    } catch (error) {
        res.json({
            type: "error",
            description: error.message
        });
    }
}
module.exports = {
    buscar,
    criar,
    editar,
    deletar
}