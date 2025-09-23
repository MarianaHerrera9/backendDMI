const pool = require('./db');

async function saveRefreshToken({ userId, token, expiresAt, ip, ua }) {
    const [result] = await pool.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
        [userId, token, expiresAt, ip || null, ua || null]
    );
    return result.insertId;
}

async function findRefreshToken(token) {
    const [rows] = await pool.query('SELECT * FROM refresh_tokens WHERE token = ?', [token]);
    return rows[0];
}

async function revokeRefreshToken(token) {
    await pool.query('UPDATE refresh_tokens SET revoked = 1 WHERE token = ?', [token]);
}

async function deleteRefreshToken(token) {
    await pool.query('DELETE FROM refresh_tokens WHERE token = ?', [token]);
}

module.exports = {
    saveRefreshToken,
    findRefreshToken,
    revokeRefreshToken,
    deleteRefreshToken
};
