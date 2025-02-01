// backend/src/routes/profile.js

const express = require("express");
const authMiddleware = require("../middleware/authMiddleware"); // Middleware para verificar token
const profileController = require("../controllers/profileController"); // Controlador para perfiles
const { body } = require("express-validator");

const router = express.Router();

// @route   GET /api/profile
// @desc    Obtener el perfil del usuario actual
// @access  Privado
router.get("/", authMiddleware, profileController.getProfile);

// @route   PUT /api/profile
// @desc    Actualizar el perfil del usuario
// @access  Privado
router.put(
  "/",
  authMiddleware,
  [
    body("name")
      .optional()
      .isString()
      .withMessage("El nombre debe ser una cadena de texto"),

    body("bio")
      .optional()
      .isString()
      .withMessage("La biografía debe ser una cadena de texto"),

    // Ajustamos la validación para que "http://localhost" sea aceptado
    body("profile_picture_url")
      .optional()
      .isURL({ require_tld: false })
      .withMessage("La URL de la imagen debe ser válida"),
  ],
  profileController.updateProfile,
);

module.exports = router;
