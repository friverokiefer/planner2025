// backend/src/controllers/authController.js
const User = require('../models/User');
const Profile = require('../models/profile'); // <-- Importamos el modelo Profile
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const authController = {
  register: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body; // Eliminamos 'role' aquí

    try {
      let user = await User.findByEmail(email);
      if (user) {
        return res.status(400).json({ msg: 'El usuario ya existe' });
      }

      // Hashear password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Crear usuario con rol 'user' por defecto
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'user',
      });

      // Justo después de crear el user, creamos su profile en la tabla "profiles"
      // Usamos updateOrCreate para no duplicar si existiera
      await Profile.updateOrCreate(user.id, {
        name: user.name,             // inicializamos con su name de la tabla users
        bio: '',                     // vacío por defecto
        profile_picture_url: '',     // vacío al inicio
      });

      // Generar token
      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || '123456',
        { expiresIn: '1h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Error del servidor');
    }
  },

  login: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findByEmail(email);
      if (!user) {
        return res.status(400).json({ msg: 'Credenciales inválidas' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Credenciales inválidas' });
      }

      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || '123456',
        { expiresIn: '1h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Error del servidor');
    }
  },

  // (Opcional) Verificar token si deseas un endpoint /verify
  verifyToken: (req, res) => {
    const token = req.body.token;
    if (!token) {
      return res.status(400).json({ msg: 'No token in request' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '123456');
      return res.json({ user: decoded.user });
    } catch (error) {
      return res.status(401).json({ msg: 'Token inválido' });
    }
  },
};

module.exports = authController;
