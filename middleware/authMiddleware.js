const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

async function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'No autorizado' });

    const parts = authHeader.split(' ');
    if (parts.length !== 2) return res.status(401).json({ message: 'Formato inválido' });

    const scheme = parts[0];
    const token = parts[1];
    if (!/^Bearer$/i.test(scheme)) return res.status(401).json({ message: 'Formato inválido' });

    try {
        const payload = jwt.verify(token, ACCESS_SECRET);
        const user = await userModel.findUserById(payload.sub);
        if (!user) return res.status(401).json({ message: 'Usuario no encontrado' });

        // adjuntamos info útil al req
        req.user = { id: user.id, email: user.email };
        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
}

module.exports = { authenticate };
