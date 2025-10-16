const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const rtModel = require('../models/refreshTokenModel');
const otpModel = require('../models/otpModel');
const {generateAccessToken, generateRefreshTokenPlain, hashToken, REFRESH_DAYS} = require("../utils/token");
const audit = require('../services/auditService');

exports.verifyOtp = async (req, res) => {
    try {
        const { userId, otpCode } = req.body;
        if (!userId || !otpCode)
            return res.status(400).json({ message: 'Faltan campos (userId, otpCode)' });

        const otpHash = hashToken(otpCode);
        const validOtp = await otpModel.findValidOtp(userId, otpHash);

        if (!validOtp) {
            await audit.log({ userId, action: 'OTP_FAILED', description: 'OTP inválido o expirado', ip: req.ip, ua: req.get('User-Agent')});
            return res.status(400).json({ message: 'OTP inválido o expirado' });
        }

        if (validOtp.attempts >= 5) {
            await otpModel.markOtpAsUsed(userId, otpHash); // bloquear
            await audit.log({ userId, action: 'OTP_BLOCKED', description: 'OTP bloqueado por demasiados intentos', ip: req.ip, ua: req.get('User-Agent')});
            return res.status(429).json({ message: 'OTP bloqueado, solicita uno nuevo' });
        }

        await otpModel.markOtpAsUsed(userId, otpHash);

        const user = await userModel.findUserById(userId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const accessToken = generateAccessToken(user);
        const refreshPlain = generateRefreshTokenPlain();
        const refreshHash = hashToken(refreshPlain);
        const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);


        await rtModel.saveRefreshToken({
            userId: user.id,
            tokenHash: refreshHash,
            expiresAt,
            ip: req.ip,
            ua: req.get('User-Agent'),
        });

        await audit.log({ userId: user.id, action: 'OTP_VERIFIED', description: 'OTP verificado, sesión iniciada', ip: req.ip, ua: req.get('User-Agent')});

        return res.json({
            message: 'Autenticación completada',
            accessToken,
            refreshToken: refreshPlain,
            user: { id: user.id, email: user.email, name: user.name },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error del servidor' });
    }
};
