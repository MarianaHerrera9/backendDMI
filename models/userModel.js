const pool = require('./db');

async function createUser({ email, password, name }) {
    const [result] = await pool.query(
        'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
        [email, password, name || null]
    );
    return { id: result.insertId, email, name };
}

async function findUserByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
}

async function findUserById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
}

module.exports = {
    createUser,
    findUserByEmail,
    findUserById
};
