const PRISMA = require("../services");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function buscar(req, res) {
  try {
    const linhas = await PRISMA.usuarios.findMany({
      omit: {
        senha: true, // nunca devolver a senha (nem o hash)
      },
      include: {
        nivel: {
          select: {
            nome: true
          }
        }
      }
    });

    res.json(linhas);
    
  } catch (error) {
    res.json({
      type: "error",
      description: error.message,
    });
  }
}

async function criar(req, res) {
  try {
    const { nome, email, senha, nivel_id } = req.body;

    if (!nome || !email || !senha || !nivel_id) {
      return res.status(400).json({
        type: "warning",
        description: "Informe nome, email, senha e nivel_id",
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await PRISMA.usuarios.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        nivel_id,
      },
    });

    res.json({
      type: "success",
      description: "Registro criado com sucesso",
    });
  } catch (error) {
    res.json({
      type: "error",
      description: error.message,
    });
  }
}

async function editar(req, res) {
  try {
    const { id } = req.params;
    const { nome, email, senha, nivel_id } = req.body;

    // só atualiza os campos permitidos e informados
    const dados = { nome, email, nivel_id };
    if (senha) {
      dados.senha = await bcrypt.hash(senha, 10);
    }
    Object.keys(dados).forEach((k) => dados[k] === undefined && delete dados[k]);

    await PRISMA.usuarios.update({
      where: {
        id,
      },
      data: { ...dados, updatedAt: new Date() },
    });

    res.json({
      type: "success",
      description: "Registro atualizado com sucesso",
    });
  } catch (error) {
    res.json({
      type: "error",
      description: error.message,
    });
  }
}

async function deletar(req, res) {
  try {
    const { id } = req.params;

    const resposta = await PRISMA.usuarios.delete({
      where: {
        id,
      },
    });

    res.json({
      type: "success",
      description: "Registro deletado com sucesso",
    });
  } catch (error) {
    res.json({
      type: "error",
      description: error.message,
    });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        type: "warning",
        description: "Informe email e senha",
      });
    }

    const usuario = await PRISMA.usuarios.findFirst({
      where: {
        email,
      },
    });

    if (!usuario) {
      return res.status(404).json({
        type: "warning",
        description: "Usuário não encontrado",
      });
    }

    let senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({
        type: "warning",
        description: "Senha inválida",
      });
    }
    delete usuario.senha; // nunca devolver a senha (nem o hash)

    let token = jwt.sign(usuario, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    res.json({
      type: "success",
      description: "Login realizado com sucesso",
      token
    });

  } catch (error) {
    res.json({
      type: "error",
      description: error.message,
    });
  }
}

module.exports = {
  buscar,
  criar,
  editar,
  deletar,
  login,
};
