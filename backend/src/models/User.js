// backend/src/models/User.js
const pool = require('../config/db');

const User = {
  // Retorna todos los usuarios (para admin)
  async getAll() {
    const query = 'SELECT id, name, email, role FROM users ORDER BY id ASC';
    const { rows } = await pool.query(query);
    return rows;
  },

  // Obtener usuario por email
  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  },

  // Obtener usuario por ID
  async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  // Crear usuario (usado por authController)
  async create({ name, email, password, role }) {
    const query = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role
    `;
    const values = [name, email, password, role || 'user'];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  /**
   * Actualiza SOLO el "name" (ejemplo). 
   * Si quieres más campos, agrega y ajusta la consulta.
   */
  async update(id, { name }) {
    const query = `
      UPDATE users
      SET name = $1
      WHERE id = $2
      RETURNING id, name, email, role
    `;
    const values = [name, id];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  },

  /**
   * Eliminar usuario por ID
   */
  async delete(id) {
    // Verificar si el user existe
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return existing; // o true, lo que prefieras
  },
};

module.exports = User;
