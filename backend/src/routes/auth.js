// backend/src/routes/auth.js

const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Registrar un nuevo usuario
// @access  Public
router.post(
  '/register',
  [
    body('name', 'El nombre es obligatorio').not().isEmpty(),
    body('email', 'Por favor, incluye un email válido').isEmail(),
    body('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
  ],
  authController.register
);

// @route   POST /api/auth/login
// @desc    Iniciar sesión
// @access  Public
router.post(
  '/login',
  [
    body('email', 'Por favor, incluye un email válido').isEmail(),
    body('password', 'La contraseña es obligatoria').exists(),
  ],
  authController.login
);

// @route   POST /api/auth/verify-token
// @desc    Verificar token JWT
// @access  Public (puede ser Privado según necesidad)
router.post('/verify-token', authController.verifyToken);

module.exports = router;
