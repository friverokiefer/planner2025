// backend/src/routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  [
    body('name', 'El nombre es obligatorio').not().isEmpty().trim(),
    body('email', 'Por favor, incluye un email válido').isEmail().trim().normalizeEmail(),
    body('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }).trim(),
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email', 'Por favor, incluye un email válido').isEmail().trim().normalizeEmail(),
    body('password', 'La contraseña es obligatoria').exists().trim(),
  ],
  authController.login
);

router.post('/verify-token', authController.verifyToken);

module.exports = router;