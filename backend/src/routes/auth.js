// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');

// Registro de usuario
router.post(
  '/register',
  [
    body('name', 'Por favor, introduce un nombre').not().isEmpty(),
    body('email', 'Por favor, introduce un email válido').isEmail(),
    body('password', 'La contraseña debe tener al menos 6 caracteres').isLength({
      min: 6,
    }),
  ],
  authController.register
);

// Inicio de sesión
router.post(
  '/login',
  [
    body('email', 'Por favor, introduce un email válido').isEmail(),
    body('password', 'La contraseña es obligatoria').exists(),
  ],
  authController.login
);

module.exports = router;