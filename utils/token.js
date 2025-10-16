const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '30', 10);

function generateAccessToken(user) {
    const payload = { sub: user.id, email: user.email, scopes: user.scopes || [] };
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

function generateRefreshTokenPlain() {
    return crypto.randomBytes(64).toString('hex'); // 128 hex chars
}

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = { generateAccessToken, generateRefreshTokenPlain, hashToken, REFRESH_DAYS };
