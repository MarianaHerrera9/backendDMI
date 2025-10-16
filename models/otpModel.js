const db = require('./db');
const crypto = require('crypto');

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

exports.saveOtp = async ({ userId, otpHash, expiresAt }) => {
    const expiresAtStr = expiresAt.toISOString().slice(0, 19).replace('T', ' ');
    const sql = `INSERT INTO user_otps (user_id, otp_hash, expires_at) VALUES (?, ?, ?)`;
    await db.query(sql, [userId, otpHash, expiresAtStr]);
};

exports.findValidOtp = async (userId, otpHash) => {
    const sql = `
    SELECT * FROM user_otps
    WHERE user_id = ? AND otp_hash = ? AND (used IS NULL OR used = 0) AND expires_at > NOW()
    LIMIT 1
  `;
    const [rows] = await db.query(sql, [userId, otpHash]);
    return rows[0];
};

exports.incrementOtpAttempt = async (id) => {
    await db.query('UPDATE user_otps SET attempts = attempts + 1, last_attempt_at = NOW() WHERE id = ?', [id]);
};

exports.markOtpAsUsed = async (userId, otpHash) => {
    const sql = `UPDATE user_otps SET used = 1 WHERE user_id = ? AND otp_hash = ?`;
    await db.query(sql, [userId, otpHash]);
};

exports.deleteExpiredOtps = async () => {
    const sql = `DELETE FROM user_otps WHERE expires_at < NOW()`;
    await db.query(sql);
};
