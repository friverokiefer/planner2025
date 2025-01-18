// backend/src/models/task.js
const pool = require('../config/db');

const Task = {
  getAll: async () => {
    const { rows } = await pool.query(
      'SELECT * FROM tasks WHERE archived_at IS NULL'
    );
    return rows;
  },

  getById: async (id) => {
    const { rows } = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return rows[0];
  },

  create: async (taskData) => {
    const {
      name,
      description,
      category,
      priority,
      difficulty,
      estimated_time,
    } = taskData;
    const { rows } = await pool.query(
      'INSERT INTO tasks (name, description, category, priority, difficulty, estimated_time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, category, priority, difficulty, estimated_time]
    );
    return rows[0];
  },

  complete: async (id) => {
    const { rows } = await pool.query(
      'UPDATE tasks SET status = $1, completed_at = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      ['Completed', new Date(), id]
    );
    return rows[0];
  },

  archive: async (id) => {
    const { rows } = await pool.query(
      'UPDATE tasks SET status = $1, archived_at = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      ['Archived', new Date(), id]
    );
    return rows[0];
  },

  unarchive: async (id) => {
    const { rows } = await pool.query(
      'UPDATE tasks SET status = $1, archived_at = NULL, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['Pending', id]
    );
    return rows[0];
  },

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
      id,
    ];
  
    console.log('Update Query:', query);
    console.log('Values:', values);
  
    try {
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Error al actualizar la tarea:', error);
      throw error;
    }
  },

  delete: async (id) => {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  },

  countAll: async () => {
    const { rows } = await pool.query('SELECT COUNT(*) FROM tasks');
    return parseInt(rows[0].count, 10);
  },

  countByStatus: async (status) => {
    const { rows } = await pool.query(
      'SELECT COUNT(*) FROM tasks WHERE status = $1',
      [status]
    );
    return parseInt(rows[0].count, 10);
  },

  getArchivedTasks: async () => {
    const { rows } = await pool.query(
      'SELECT * FROM tasks WHERE archived_at IS NOT NULL'
    );
    return rows;
  },
  getDifficultyByPriority: async () => {
    const { rows } = await pool.query(
      'SELECT priority, AVG(difficulty) as avg_difficulty FROM tasks GROUP BY priority'
    );
    return rows;
  },
};

module.exports = Task;