const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const {authenticate} = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

router.get('/', authenticate, doctorController.getDoctors);
router.get('/:id', authenticate, doctorController.getDoctor);

router.post('/', authenticate, authorize(['admin']), doctorController.createDoctor);
router.put('/:id', authenticate, authorize(['admin']), doctorController.updateDoctor);
router.delete('/:id', authenticate, authorize(['admin']),  doctorController.deleteDoctor);

module.exports = router;
