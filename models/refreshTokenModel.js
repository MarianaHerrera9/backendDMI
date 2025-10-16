const pool = require('./db');

async function saveRefreshToken({ userId, tokenHash, expiresAt, ip, ua }) {
    const [result] = await pool.query(
        'INSERT INTO refresh_tokens (user_id, token_hash, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
        [userId, tokenHash, expiresAt, ip || null, ua || null]
    );
    return result.insertId;
}

async function findRefreshToken(hash) {
    const [rows] = await pool.query('SELECT * FROM refresh_tokens WHERE token_hash = ?', [hash]);
    return rows[0];
}

async function revokeRefreshTokenById(id, replacedById = null) {
    await pool.query('UPDATE refresh_tokens SET revoked = 1, replaced_by = ? WHERE id = ?', [replacedById, id]);
}

async function revokeRefreshToken(hash) {
    await pool.query('UPDATE refresh_tokens SET revoked = 1 WHERE token_hash = ?', [hash]);
}

async function revokeAllForUser(userId) {
    await pool.query('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?', [userId]);
}

async function deleteRefreshToken(hash) {
    await pool.query('DELETE FROM refresh_tokens WHERE token_hash = ?', [hash]);
}

module.exports = {
    saveRefreshToken,
    findRefreshToken,
    revokeRefreshToken,
    deleteRefreshToken,
    revokeRefreshTokenById,
    revokeAllForUser
};
