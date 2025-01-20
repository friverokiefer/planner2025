// backend/src/controllers/authController.js

const User = require('../models/User');
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

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = await User.create({
                name,
                email,
                password: hashedPassword,
                role: 'user' // Asigna 'user' por defecto
            });

            const payload = {
                user: {
                    id: user.id,
                    role: user.role
                },
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET || '123456', // Asegúrate de tener una variable de entorno para JWT_SECRET
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
                    role: user.role
                },
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET || '123456', // Asegúrate de tener una variable de entorno para JWT_SECRET
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
};

module.exports = authController;
