const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const otpController = require('../controllers/otpController');

router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Email inválido'),
        body('password').isLength({ min: 6 }).withMessage('Password mínimo 6 caracteres')
    ],
    authController.register
);

router.post('/login', authController.login);

router.post('/verify-otp', otpController.verifyOtp);

router.post('/refresh', authController.refresh);

router.post('/logout', authController.logout);

module.exports = router;
