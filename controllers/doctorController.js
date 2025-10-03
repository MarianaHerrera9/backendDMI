const Doctor = require('../models/doctorModel');
const { v4: uuidv4 } = require('uuid');

exports.getDoctors = async (req, res) => {
    try {
        const results = await Doctor.getAllDoctors();
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getDoctor = async (req, res) => {
    try {
        const id = req.params.id;
        const results = await Doctor.getDoctorById(id);
        if (results.length === 0) return res.status(404).json({ message: 'Doctor no encontrado' });
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createDoctor = async (req, res) => {
    try {
        const newDoctor = { id: uuidv4(), ...req.body };
        await Doctor.createDoctor(newDoctor);
        res.status(201).json({ message: 'Doctor creado', id: newDoctor.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateDoctor = async (req, res) => {
    try {
        const id = req.params.id;
        await Doctor.updateDoctor(id, req.body);
        res.json({ message: 'Doctor actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteDoctor = async (req, res) => {
    try {
        const id = req.params.id;
        await Doctor.deleteDoctor(id);
        res.json({ message: 'Doctor eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};