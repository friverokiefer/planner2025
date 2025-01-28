// backend/src/models/task.js
const pool = require('../config/db');

const Task = {
  /**
   * Crear una nueva tarea.
   * Se asume que el frontend envía: 
   * { status, difficulty, priority, ... } 
   * y aquí los mapeamos a: 
   *   state = status, difficulty como string, priority como text
   */
  async create(taskData) {
    const {
      user_id,
      title,
      description,
      status,
      difficulty,
      priority,
      start_date,
      end_date,
      is_active,
      total_time_spent,
    } = taskData;

    // Mapeamos al esquema de la BD:
    const stateValue = status || null; 
    const difficultyValue = (difficulty !== undefined)
      ? String(difficulty)
      : null;
    const priorityValue = priority || null;

    const query = `
      INSERT INTO task
        (user_id, title, description,
         state, difficulty, priority,
         start_date, end_date, is_active, total_time_spent, created_at)
      VALUES
        ($1, $2, $3,
         $4, $5, $6,
         $7, $8, $9, $10, now())
      RETURNING *
    `;
    const values = [
      user_id,
      title,
      description || '',
      stateValue,
      difficultyValue,
      priorityValue,
      start_date || new Date(),
      end_date || null,
      is_active || false,
      total_time_spent || '00:00:00', // interval
    ];

    try {
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Task.create:', error.message);
      throw error;
    }
  },

  // ---------------------------------------------------------------------------------
  // Los demás métodos: getAll, getAllByUserId, etc. 
  // (aquí solo resaltamos los relevantes).
  // ---------------------------------------------------------------------------------

  async getAll() {
    const query = `
      SELECT * FROM task
      WHERE archived_at IS NULL
      ORDER BY created_at DESC
    `;
    try {
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error('Task.getAll:', error.message);
      throw error;
    }
  },

  async getAllByUserId(userId) {
    const query = `
      SELECT * FROM task
      WHERE user_id = $1
        AND archived_at IS NULL
      ORDER BY created_at DESC
    `;
    try {
      const { rows } = await pool.query(query, [userId]);
      return rows;
    } catch (error) {
      console.error('Task.getAllByUserId:', error.message);
      throw error;
    }
  },

  async getById(taskId) {
    const query = `
      SELECT * FROM task
      WHERE id = $1
    `;
    try {
      const { rows } = await pool.query(query, [taskId]);
      return rows[0];
    } catch (error) {
      console.error('Task.getById:', error.message);
      throw error;
    }
  },

  async getByIdAndUser(taskId, userId) {
    const query = `
      SELECT * FROM task
      WHERE id = $1
        AND user_id = $2
    `;
    try {
      const { rows } = await pool.query(query, [taskId, userId]);
      return rows[0];
    } catch (error) {
      console.error('Task.getByIdAndUser:', error.message);
      throw error;
    }
  },

  /**
   * Completar => state="Completed"
   */
  async complete(taskId) {
    const query = `
      UPDATE task
      SET 
        is_active = FALSE,
        state = 'Completed',
        completed_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    try {
      const { rows } = await pool.query(query, [taskId]);
      return rows[0];
    } catch (error) {
      console.error('Task.complete:', error.message);
      throw error;
    }
  },

  /**
   * Archivar => state="Archived"
   */
  async archive(taskId) {
    const query = `
      UPDATE task
      SET 
        archived_at = NOW(),
        state = 'Archived',
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    try {
      const { rows } = await pool.query(query, [taskId]);
      return rows[0];
    } catch (error) {
      console.error('Task.archive:', error.message);
      throw error;
    }
  },

  /**
   * Desarchivar => archived_at=NULL
   */
  async unarchive(taskId) {
    const query = `
      UPDATE task
      SET
        archived_at = NULL,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    try {
      const { rows } = await pool.query(query, [taskId]);
      return rows[0];
    } catch (error) {
      console.error('Task.unarchive:', error.message);
      throw error;
    }
  },

  /**
   * Actualizar una tarea
   * (El front envía status => state, difficulty => text, priority => text)
   */
  async update(taskId, updateData) {
    const {
      title,
      description,
      status,
      difficulty,
      priority,
      start_date,
      end_date,
      is_active,
      total_time_spent,
    } = updateData;

    const fields = [];
    const values = [];
    let index = 1;

    if (title !== undefined) {
      fields.push(`title = $${index++}`);
      values.push(title);
    }
    if (description !== undefined) {
      fields.push(`description = $${index++}`);
      values.push(description);
    }
    // status => state
    if (status !== undefined) {
      fields.push(`state = $${index++}`);
      values.push(status);
    }
    // difficulty => text
    if (difficulty !== undefined) {
      fields.push(`difficulty = $${index++}`);
      values.push(String(difficulty));
    }
    if (priority !== undefined) {
      fields.push(`priority = $${index++}`);
      values.push(priority);
    }
    if (start_date !== undefined) {
      fields.push(`start_date = $${index++}`);
      values.push(start_date);
    }
    if (end_date !== undefined) {
      fields.push(`end_date = $${index++}`);
      values.push(end_date);
    }
    if (is_active !== undefined) {
      fields.push(`is_active = $${index++}`);
      values.push(is_active);
    }
    if (total_time_spent !== undefined) {
      // suponer que es algo en interval => sumamos
      fields.push(`total_time_spent = total_time_spent + $${index++}`);
      values.push(total_time_spent);
    }

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    const query = `
      UPDATE task
      SET
        ${fields.join(', ')},
        updated_at = NOW()
      WHERE id = $${index}
      RETURNING *
    `;
    values.push(taskId);

    try {
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Task.update:', error.message);
      throw error;
    }
  },

  async delete(taskId) {
    const query = `DELETE FROM task WHERE id = $1`;
    try {
      const res = await pool.query(query, [taskId]);
      return res.rowCount > 0;
    } catch (error) {
      console.error('Task.delete:', error.message);
      throw error;
    }
  },

  async getArchivedTasks() {
    const query = `
      SELECT * FROM task
      WHERE archived_at IS NOT NULL
      ORDER BY archived_at DESC
    `;
    try {
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error('Task.getArchivedTasks:', error.message);
      throw error;
    }
  },

  async getArchivedTasksByUserId(userId) {
    const query = `
      SELECT * FROM task
      WHERE archived_at IS NOT NULL
        AND user_id = $1
      ORDER BY archived_at DESC
    `;
    try {
      const { rows } = await pool.query(query, [userId]);
      return rows;
    } catch (error) {
      console.error('Task.getArchivedTasksByUserId:', error.message);
      throw error;
    }
  },

  // Y los métodos count... si requieres
};

module.exports = Task;
