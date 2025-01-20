// backend/src/models/User.js
const pool = require('../config/db');

const User = {
    create: async (userData) => {
        const { name, email, password, role } = userData;
        const userRole = role || 'user'; // Asigna 'user' por defecto si no se proporciona rol
        const result = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, password, userRole]
        );
        return result.rows[0];
    },

    findByEmail: async (email) => {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    },

    findById: async (id) => {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0];
    },

    getAll: async () => {
        const result = await pool.query('SELECT id, name, email, role FROM users');
        return result.rows;
    },

    update: async (id, userData) => {
        const { name, email, password, role } = userData;
        const userRole = role || 'user'; // Asigna 'user' por defecto si no se proporciona rol

        let query = 'UPDATE users SET name = $1, email = $2, role = $3';
        const values = [name, email, userRole];
        let count = 4;

        if (password) {
            query += ', password = $4';
            values.push(password);
            count++;
        }

        query += ` WHERE id = $${count} RETURNING id, name, email, role`;
        values.push(id);

        const result = await pool.query(query, values);
        return result.rows[0];
    },

    delete: async (id) => {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, name, email, role', [id]);
        return result.rows[0];
    },
};

module.exports = User;
