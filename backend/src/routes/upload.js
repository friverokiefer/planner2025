// backend/src/routes/upload.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configurar multer (almacenamiento en carpeta 'uploads')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Asegúrate de tener 'uploads/' en tu backend
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Generar nombre único
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Filtrar solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif)'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// POST /api/upload/profile-picture
router.post('/profile-picture', upload.single('profilePicture'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }
  // BASE_URL en tu .env o valor por defecto
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
  return res.json({ imageUrl });
});

module.exports = router;
