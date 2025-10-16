const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const rtModel = require('../models/refreshTokenModel');
const {findUserByEmail} = require("../models/userModel");
const otpModel = require("../models/otpModel");
const {sendEmail} = require("../services/mailService");
const { hashToken, generateAccessToken, generateRefreshTokenPlain, REFRESH_DAYS } = require('../utils/token');
const audit = require('../services/auditService');

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

        return res.status(201).json({ message: 'Usuario creado', user: { id: user.id, email, name } });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error del servidor' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await findUserByEmail(email);
        if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Credenciales inválidas' });

        // Generar OTP (6 dígitos)
        const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHash = hashToken(otpPlain);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

        // Guardar OTP en la BD
        await otpModel.saveOtp({ userId: user.id, otpHash, expiresAt });

        // Enviar por correo con SendGrid
        await sendEmail({
            to: user.email,
            subject: 'Tu código de verificación',
            text: `Tu código OTP es ${otpPlain}. Expira en 5 minutos.`,
            html: `<p>Tu código OTP es <strong>${otpPlain}</strong>. Expira en 5 minutos.</p>`,
        });

        const audit = require('../services/auditService');
        await audit.log({ userId: user.id, action: 'OTP_SENT', description: 'OTP enviado por correo', ip: req.ip, ua: req.get('User-Agent') });

        return res.json({ message: 'OTP enviado a tu correo', userId: user.id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error del servidor' });
    }
};

{/*
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
*/}

exports.refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ message: 'Refresh token requerido' });

        const tokenHash = hashToken(refreshToken);
        const stored = await rtModel.findRefreshToken(tokenHash);
        if (!stored) {
            await audit.log({ action: 'REFRESH_NOT_FOUND', description: 'Refresh token no encontrado', ip: req.ip, ua: req.get('User-Agent')});
            return res.status(401).json({ message: 'Refresh token inválido' });
        }

        if (stored.revoked) {
            // reuse detected: revoke all user tokens and log
            await rtModel.revokeAllForUser(stored.user_id);
            await audit.log({ userId: stored.user_id, action: 'REFRESH_REUSE_DETECTED', description: `Token reuse detected id=${stored.id}`, ip: req.ip, ua: req.get('User-Agent')});
            return res.status(401).json({ message: 'Refresh token inválido / reutilizado' });
        }

        if (new Date(stored.expires_at) < new Date()) {
            await audit.log({ userId: stored.user_id, action: 'REFRESH_EXPIRED', description: `Refresh expired id=${stored.id}`, ip: req.ip, ua: req.get('User-Agent')});
            return res.status(401).json({ message: 'Refresh token expirado' });
        }

        const user = await userModel.findUserById(stored.user_id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        // crear nuevo refresh y revocar el viejo
        const newPlain = generateRefreshTokenPlain();
        const newHash = hashToken(newPlain);
        const newExpires = new Date(Date.now() + REFRESH_DAYS * 24*60*60*1000);
        const newId = await rtModel.saveRefreshToken({ userId: user.id, tokenHash: newHash, expiresAt: newExpires, ip: req.ip, ua: req.get('User-Agent') });

        await rtModel.revokeRefreshTokenById(stored.id, newId);

        const newAccess = generateAccessToken(user);
        await audit.log({ userId: user.id, action: 'REFRESH_SUCCESS', description: `rotated ${stored.id} -> ${newId}`, ip: req.ip, ua: req.get('User-Agent') });

        return res.json({ accessToken: newAccess, refreshToken: newPlain });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error del servidor' });
    }
};


exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ message: 'Refresh token requerido' });

        const hashedToken = hashToken(refreshToken);
        await rtModel.revokeRefreshToken(hashedToken);
        await audit.log({ action: 'LOGOUT', description: 'Logout con refresh revocado', ip: req.ip, ua: req.get('User-Agent') });
        return res.json({ message: 'Logout ok' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error del servidor' });
    }
};
