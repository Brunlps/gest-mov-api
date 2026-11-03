const PRISMA = require("../services");

async function buscar(req, res) {
    try {
        const linhas = await PRISMA.usuarios.findMany();

        res.json(linhas)

    } catch (error) {
        req.json({
            type: "error",
            description: error.messager
        });
    }
}

async function criar(req, res) {
    try {
        const { nome, email, senha, n_veis_id } = req.body;

        await PRISMA.usuarios.create({
            data: {
                nome,
                email,
                senha,
                n_veis_id
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
        const { nome, email, senha, n_veis_id } = req.body;

        const dados = req.body;

        const resposta = await PRISMA.usuarios.update({

            where: {
                id
            },
            data: dados
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

        const resposta = await PRISMA.usuarios.delete({
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