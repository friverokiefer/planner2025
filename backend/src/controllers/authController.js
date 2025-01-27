// backend/src/controllers/authController.js

const User = require('../models/User');
const Profile = require('../models/profile');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const authController = {
  register: async (req, res) => {
    console.log('AuthController: Iniciando registro');

    // Validación de entradas
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('AuthController: Errores de validación', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body; // 'role' no se recibe del frontend
    console.log(`AuthController: Datos recibidos - Nombre: ${name}, Email: ${email}`);

    try {
      // Verificar si el usuario ya existe
      let user = await User.findByEmail(email);
      if (user) {
        console.log('AuthController: El usuario ya existe');
        return res.status(400).json({ msg: 'El usuario ya existe' });
      }

      // Hashear la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log('AuthController: Contraseña hasheada');

      // Crear el nuevo usuario con rol 'user' por defecto
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'user',
      });
      console.log(`AuthController: Usuario creado con ID ${user.id}`);

      // Crear el perfil del usuario
      const profile = await Profile.updateOrCreate(user.id, {
        name: user.name,             // Inicializar con el nombre del usuario
        bio: '',                     // Biografía vacía por defecto
        profile_picture_url: '',     // URL de foto vacía al inicio
      });
      console.log(`AuthController: Perfil creado para el usuario ID ${user.id}`);

      // Generar el token JWT
      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || '123456', // Asegúrate de definir JWT_SECRET en tu .env
        { expiresIn: '1h' },
        (err, token) => {
          if (err) {
            console.error('AuthController: Error al generar el token JWT', err);
            return res.status(500).json({ msg: 'Error al generar el token' });
          }
          console.log('AuthController: Token JWT generado exitosamente');
          res.status(201).json({ token });
        }
      );
    } catch (error) {
      console.error('AuthController: Error durante el registro', error.message);
      res.status(500).send('Error del servidor');
    }
  },

  login: async (req, res) => {
    console.log('AuthController: Iniciando login');

    // Validación de entradas
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('AuthController: Errores de validación', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log(`AuthController: Datos de login - Email: ${email}`);

    try {
      // Buscar el usuario por email
      let user = await User.findByEmail(email);
      if (!user) {
        console.log('AuthController: Usuario no encontrado');
        return res.status(400).json({ msg: 'Credenciales inválidas' });
      }

      // Comparar la contraseña
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log('AuthController: Contraseña incorrecta');
        return res.status(400).json({ msg: 'Credenciales inválidas' });
      }

      // Generar el token JWT
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
          if (err) {
            console.error('AuthController: Error al generar el token JWT', err);
            return res.status(500).json({ msg: 'Error al generar el token' });
          }
          console.log('AuthController: Token JWT generado exitosamente');
          res.json({ token });
        }
      );
    } catch (error) {
      console.error('AuthController: Error durante el login', error.message);
      res.status(500).send('Error del servidor');
    }
  },

  // (Opcional) Verificar token
  verifyToken: (req, res) => {
    console.log('AuthController: Verificando token');

    const token = req.body.token;
    if (!token) {
      console.log('AuthController: No se proporcionó token');
      return res.status(400).json({ msg: 'No token in request' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '123456');
      console.log('AuthController: Token válido');
      return res.json({ user: decoded.user });
    } catch (error) {
      console.log('AuthController: Token inválido');
      return res.status(401).json({ msg: 'Token inválido' });
    }
  },
};

module.exports = authController;
