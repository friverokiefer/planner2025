// backend/src/models/task.js
const pool = require('../config/db');

const Task = {
  // Tareas activas (admin)
  getAll: async () => {
    const { rows } = await pool.query(
      'SELECT * FROM tasks WHERE archived_at IS NULL'
    );
    return rows;
  },

  // Tareas activas (user)
  getAllByUserId: async (userId) => {
    const { rows } = await pool.query(
      'SELECT * FROM tasks WHERE archived_at IS NULL AND user_id = $1',
      [userId]
    );
    return rows;
  },

  // Obtener tarea por ID (admin)
  getById: async (id) => {
    const { rows } = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [id]
    );
    return rows[0];
  },

  // Obtener tarea por ID (user)
  getByIdAndUser: async (id, userId) => {
    const { rows } = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return rows[0];
  },

  // Crear nueva tarea
  create: async (taskData) => {
    const {
      name,
      description,
      category,
      priority,
      difficulty,
      estimated_time,
      user_id,
      status = 'Pending',
    } = taskData;

    const query = `
      INSERT INTO tasks
        (name, description, category, priority, difficulty, estimated_time, user_id, status)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      name || null,
      description || null,
      category || null,
      priority || null,
      difficulty || null,
      estimated_time || null,
      user_id,
      status,
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // Completar (status = 'Completed')
  complete: async (id) => {
    const { rows } = await pool.query(
      `UPDATE tasks 
       SET status = $1, completed_at = NOW(), updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      ['Completed', id]
    );
    return rows[0];
  },

  // Archivar (status = 'Archived')
  archive: async (id) => {
    const { rows } = await pool.query(
      `UPDATE tasks 
       SET status = $1, archived_at = NOW(), updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      ['Archived', id]
    );
    return rows[0];
  },

  // Desarchivar (status = 'Pending')
  unarchive: async (id) => {
    const { rows } = await pool.query(
      `UPDATE tasks 
       SET status = $1, archived_at = NULL, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      ['Pending', id]
    );
    return rows[0];
  },

  // Actualizar
  update: async (id, taskData) => {
    const {
      name,
      description,
      category,
      priority,
      difficulty,
      status,
      completed_at,
      time_taken,
      archived_at,
      estimated_time,
      actual_time,
    } = taskData;

    const query = `
      UPDATE tasks
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        priority = COALESCE($4, priority),
        difficulty = COALESCE($5, difficulty),
        status = COALESCE($6, status),
        completed_at = COALESCE($7, completed_at),
        time_taken = COALESCE($8, time_taken),
        archived_at = COALESCE($9, archived_at),
        estimated_time = COALESCE($10, estimated_time),
        actual_time = COALESCE($11, actual_time),
        updated_at = NOW()
      WHERE id = $12
      RETURNING *;
    `;

    const values = [
      name || null,
      description || null,
      category || null,
      priority || null,
      difficulty || null,
      status || null,
      completed_at || null,
      time_taken || null,
      archived_at || null,
      estimated_time || null,
      actual_time || null,
      id,
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // Eliminar
  delete: async (id) => {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  },

  // Tareas archivadas (admin)
  getArchivedTasks: async () => {
    const { rows } = await pool.query(
      'SELECT * FROM tasks WHERE archived_at IS NOT NULL'
    );
    return rows;
  },

  // Tareas archivadas (user)
  getArchivedTasksByUserId: async (userId) => {
    const { rows } = await pool.query(
      'SELECT * FROM tasks WHERE archived_at IS NOT NULL AND user_id = $1',
      [userId]
    );
    return rows;
  },

  // Contar todas las tareas (admin)
  countAll: async () => {
    const { rows } = await pool.query('SELECT COUNT(*) FROM tasks');
    return parseInt(rows[0].count, 10);
  },

  // Contar todas las tareas (user)
  countAllForUser: async (userId) => {
    const { rows } = await pool.query(
      'SELECT COUNT(*) FROM tasks WHERE user_id = $1',
      [userId]
    );
    return parseInt(rows[0].count, 10);
  },

  // Contar tareas por status (admin)
  countByStatus: async (status) => {
    const { rows } = await pool.query(
      'SELECT COUNT(*) FROM tasks WHERE status = $1',
      [status]
    );
    return parseInt(rows[0].count, 10);
  },

  // Contar tareas por status (user)
  countByStatusForUser: async (status, userId) => {
    const { rows } = await pool.query(
      'SELECT COUNT(*) FROM tasks WHERE status = $1 AND user_id = $2',
      [status, userId]
    );
    return parseInt(rows[0].count, 10);
  },
};

module.exports = Task;
