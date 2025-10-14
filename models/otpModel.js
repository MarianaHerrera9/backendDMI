const db = require('./db');

exports.saveOtp = async ({ userId, otpCode, expiresAt }) => {
    const expiresAtStr = expiresAt.toISOString().slice(0, 19).replace('T', ' ');
    const sql = `
    INSERT INTO user_otps (user_id, otp_code, expires_at)
    VALUES (?, ?, ?)
  `;
    console.log('Guardando OTP:', { userId, otpCode: otpCode.toString(), expiresAt: expiresAtStr });
    await db.query(sql, [userId, otpCode.toString(), expiresAtStr]);
};

exports.findValidOtp = async (userId, otpCode) => {
    const sql = `
    SELECT * FROM user_otps
    WHERE user_id = ? AND otp_code = ? AND (used IS NULL OR used = FALSE) AND expires_at > NOW()
    LIMIT 1
  `;
    const [rows] = await db.query(sql, [userId, otpCode.toString()]);
    console.log('Buscando OTP:', { userId, otpCode: otpCode.toString(), found: rows });
    return rows[0];
};

exports.markOtpAsUsed = async (userId, otpCode) => {
    const sql = `UPDATE user_otps SET used = TRUE WHERE user_id = ? AND otp_code = ?`;
    await db.query(sql, [userId, otpCode.toString()]);
};


exports.deleteExpiredOtps = async () => {
    const sql = `DELETE FROM user_otps WHERE expires_at < NOW()`;
    await db.query(sql);
};
