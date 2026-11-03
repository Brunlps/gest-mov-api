function validadorDados(req, res, next) {
    const { nome } = req.boby;

    if (!nome) {
        res.json({
            type: "warning",
            description: "Coluna nome não insformada"
        })
    }

    next();

};

module.exports = {
    validadorDados
};