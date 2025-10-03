const db = require('./db');

const getAllDoctors = async () => {
    const [rows] = await db.query('SELECT * FROM doctor');
    return rows;
};

const getDoctorById = async (id) => {
    const [rows] = await db.query('SELECT * FROM doctor WHERE id = ?', [id]);
    return rows;
};

const createDoctor = async (doctor) => {
    const { id, name, speciality, rating, hospital, avatar, slots } = doctor;
    const [result] = await db.query(
        'INSERT INTO doctor (id, name, speciality, rating, hospital, avatar, slots) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, name, speciality, rating, hospital, avatar, JSON.stringify(slots)]
    );
    return result;
};

const updateDoctor = async (id, doctor) => {
    const { name, speciality, rating, hospital, avatar, slots } = doctor;
    const [result] = await db.query(
        'UPDATE doctor SET name = ?, speciality = ?, rating = ?, hospital = ?, avatar = ?, slots = ? WHERE id = ?',
        [name, speciality, rating, hospital, avatar, JSON.stringify(slots), id]
    );
    return result;
};

const deleteDoctor = async (id) => {
    const [result] = await db.query('DELETE FROM doctor WHERE id = ?', [id]);
    return result;
};

module.exports = {
    getAllDoctors,
    getDoctorById,
    createDoctor,
    updateDoctor,
    deleteDoctor
};
