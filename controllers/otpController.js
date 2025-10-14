const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const rtModel = require('../models/refreshTokenModel');
const otpModel = require('../models/otpModel');

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

exports.verifyOtp = async (req, res) => {
    try {
        const { userId, otpCode } = req.body;
        if (!userId || !otpCode)
            return res.status(400).json({ message: 'Faltan campos (userId, otpCode)' });

        const validOtp = await otpModel.findValidOtp(userId, otpCode);
        if (!validOtp) return res.status(400).json({ message: 'OTP inválido o expirado' });

        await otpModel.markOtpAsUsed(userId, otpCode);

        const user = await userModel.findUserById(userId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        // Generar tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);

        await rtModel.saveRefreshToken({
            userId: user.id,
            token: refreshToken,
            expiresAt,
            ip: req.ip,
            ua: req.get('User-Agent'),
        });

        return res.json({
            message: 'Autenticación completada',
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email, name: user.name },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error del servidor' });
    }
};
