// backend/src/models/User.js

const pool = require("../config/db");

const User = {
  // Retorna todos los usuarios (para admin)
  async getAll() {
    try {
      const query = "SELECT id, name, email, role FROM users ORDER BY id ASC";
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error("User.getAll:", error.message);
      throw error;
    }
  },

  // Obtener usuario por email
  async findByEmail(email) {
    try {
      const query = "SELECT * FROM users WHERE email = $1";
      const { rows } = await pool.query(query, [email]);
      return rows[0];
    } catch (error) {
      console.error("User.findByEmail:", error.message);
      throw error;
    }
  },

  // Obtener usuario por ID
  async findById(id) {
    try {
      const query = "SELECT * FROM users WHERE id = $1";
      const { rows } = await pool.query(query, [id]);
      return rows[0];
    } catch (error) {
      console.error("User.findById:", error.message);
      throw error;
    }
  },

  // Crear usuario (usado por authController)
  async create({ name, email, password, role }) {
    try {
      const query = `
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role
      `;
      const values = [name, email, password, role || "user"];
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error("User.create:", error.message);
      throw error;
    }
  },

  /**
   * Actualiza SOLO el "name" (ejemplo).
   * Si quieres más campos, agrega y ajusta la consulta.
   */
  async update(id, { name }) {
    try {
      const query = `
        UPDATE users
        SET name = $1
        WHERE id = $2
        RETURNING id, name, email, role
      `;
      const values = [name, id];
      const { rows } = await pool.query(query, values);
      return rows[0] || null;
    } catch (error) {
      console.error("User.update:", error.message);
      throw error;
    }
  },

  /**
   * Eliminar usuario por ID
   */
  async delete(id) {
    try {
      // Verificar si el user existe
      const existing = await this.findById(id);
      if (!existing) {
        return null;
      }
      await pool.query("DELETE FROM users WHERE id = $1", [id]);
      return existing; // o true, lo que prefieras
    } catch (error) {
      console.error("User.delete:", error.message);
      throw error;
    }
  },
};

module.exports = User;
