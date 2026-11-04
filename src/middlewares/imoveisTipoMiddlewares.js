function validadorDados(req, res, next) {
    const { nome } = req.body || {};

    if (!nome) {
        return res.status(400).json({
            type: "warning",
            description: "Coluna nome não informada"
        });
    }

    next();
}

module.exports = {
    validadorDados
};
