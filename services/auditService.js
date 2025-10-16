const db = require('../models/db');

async function log({ userId = null, action, description = null, ip = null, ua = null }) {
    try {
        await db.query(
            `INSERT INTO audit_logs (user_id, action, description, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?)`,
            [userId, action, description, ip, ua]
        );
    } catch (err) {
        console.error('Failed to write audit log', err);
    }
}

module.exports = { log };
