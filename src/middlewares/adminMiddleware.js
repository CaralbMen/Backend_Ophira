module.exports = (req, res, next) => {
    const rol = Number(req?.usuario?.rol);

    if (rol !== 1) {
        return res.status(403).json({ msg: 'Acceso denegado. Solo administradores.' });
    }

    next();
};
