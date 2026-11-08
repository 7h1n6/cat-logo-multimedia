const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rutas de vistas
router.get('/register', authController.renderRegister);
router.get('/login', authController.renderLogin);

// Rutas de acción
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

module.exports = router;
