const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const rtModel = require('../models/refreshTokenModel');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '30', 10);

function generateAccessToken(user) {
    return jwt.sign({ sub: user.id, email: user.email }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

function generateRefreshToken(user) {
    return jwt.sign({ sub: user.id }, REFRESH_SECRET, { expiresIn: `${REFRESH_DAYS}d` });
}

exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email, password, name } = req.body;
        const existing = await userModel.findUserByEmail(email);
        if (existing) return res.status(400).json({ message: 'Email ya registrado' });

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        const user = await userModel.createUser({ email, password: hashed, name });
        return res.status(201).json({ message: 'Usuario creado', user: { id: user.id, email } });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error del servidor' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findUserByEmail(email);
        if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Credenciales inválidas' });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
        await rtModel.saveRefreshToken({
            userId: user.id,
            token: refreshToken,
            expiresAt,
            ip: req.ip,
            ua: req.get('User-Agent')
        });

        return res.json({
            accessToken,
            refreshToken,
            expiresIn: ACCESS_EXPIRES
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error del servidor' });
    }
};

exports.refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ message: 'Refresh token requerido' });

        // verificamos token aqui
        let payload;
        try {
            payload = jwt.verify(refreshToken, REFRESH_SECRET);
        } catch (e) {
            return res.status(401).json({ message: 'Refresh token inválido' });
        }

        const stored = await rtModel.findRefreshToken(refreshToken);
        if (!stored || stored.revoked) return res.status(401).json({ message: 'Refresh token no valido / revocado' });
        if (new Date(stored.expires_at) < new Date()) {
            return res.status(401).json({ message: 'Refresh token expirado' });
        }

        const user = await userModel.findUserById(payload.sub);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        // generamos uno nuevo y borrar el antiguo
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        const newExpiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);

        // invalidar token viejo y guardar el nuevo
        await rtModel.revokeRefreshToken(refreshToken);
        await rtModel.saveRefreshToken({
            userId: user.id,
            token: newRefreshToken,
            expiresAt: newExpiresAt,
            ip: req.ip,
            ua: req.get('User-Agent')
        });

        return res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error del servidor' });
    }
};

exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ message: 'Refresh token requerido' });

        await rtModel.deleteRefreshToken(refreshToken);
        return res.json({ message: 'Logout ok' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error del servidor' });
    }
};
