const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validations, validate } = require('../middleware/validator');

// Rutas públicas
router.post('/login', validations.login, validate, authController.login);
router.post('/register', authController.register);
router.post('/forgot-password', authController.forgotPassword);

// Rutas protegidas
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/change-password', authenticate, authController.changePassword);

module.exports = router;

