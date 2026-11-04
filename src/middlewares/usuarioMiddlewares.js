function usuariosAutenticado(req, res, next) {

    let authorization = req.headers.authorization.split(" ")[1];

    if (!authorization) {
        res.status(401).json({
            type: "warning",
            description: "Token é necessário",
        });
        return;
    };

    let token = authorization;

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                type: "warning",
                description: "Token inválido",
            });
        }

        // req.user = decoded; isso é opcional, caso queira acessar os dados do usuário decodificado em rotas subsequentes
        next();
    });
};

module.exports = {
    usuariosAutenticado,
};
