// backend/src/models/task.js
const pool = require('../config/db');

const Task = {
  /**
   * Crear una nueva tarea
   * @param {Object} taskData - Datos de la tarea
   * @returns {Object} - Tarea creada
   */
  async create(taskData) {
    const { user_id, title, description, start_date, end_date, is_active, total_time_spent } = taskData;

    const query = `
      INSERT INTO task 
        (user_id, title, description, start_date, end_date, is_active, total_time_spent)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      user_id,
      title,
      description || '',
      start_date || new Date(),
      is_active ? end_date : null,
      is_active || false,
      total_time_spent || 0, // Inicializar en 0 si no se proporciona
    ];

    try {
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Task.create:', error.message);
      throw error;
    }
  },

  /**
   * Obtener todas las tareas activas (sin archivar)
   * @returns {Array} - Lista de tareas
   */
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

  /**
   * Obtener todas las tareas activas de un usuario específico
   * @param {Integer} userId - ID del usuario
   * @returns {Array} - Lista de tareas
   */
  async getAllByUserId(userId) {
    const query = `
      SELECT * FROM task
      WHERE user_id = $1 AND archived_at IS NULL
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

  /**
   * Obtener una tarea por su ID
   * @param {Integer} taskId - ID de la tarea
   * @returns {Object} - Tarea encontrada
   */
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

  /**
   * Obtener una tarea por su ID y el ID del usuario
   * @param {Integer} taskId - ID de la tarea
   * @param {Integer} userId - ID del usuario
   * @returns {Object} - Tarea encontrada
   */
  async getByIdAndUser(taskId, userId) {
    const query = `
      SELECT * FROM task
      WHERE id = $1 AND user_id = $2
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
   * Completar una tarea (is_active = false, completed_at = NOW())
   * @param {Integer} taskId - ID de la tarea
   * @returns {Object} - Tarea actualizada
   */
  async complete(taskId) {
    const query = `
      UPDATE task 
      SET is_active = FALSE, completed_at = NOW(), updated_at = NOW() 
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
   * Archivar una tarea (archived_at = NOW())
   * @param {Integer} taskId - ID de la tarea
   * @returns {Object} - Tarea actualizada
   */
  async archive(taskId) {
    const query = `
      UPDATE task 
      SET archived_at = NOW(), updated_at = NOW() 
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
   * Desarchivar una tarea (archived_at = NULL)
   * @param {Integer} taskId - ID de la tarea
   * @returns {Object} - Tarea actualizada
   */
  async unarchive(taskId) {
    const query = `
      UPDATE task 
      SET archived_at = NULL, updated_at = NOW() 
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
   * @param {Integer} taskId - ID de la tarea
   * @param {Object} updateData - Datos a actualizar
   * @returns {Object} - Tarea actualizada
   */
  async update(taskId, updateData) {
    const { title, description, start_date, end_date, is_active, total_time_spent } = updateData;

    // Construir dinámicamente la consulta de actualización
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
      // Si is_active es false, limpiar end_date
      if (!is_active) {
        fields.push(`end_date = NULL`);
      }
    }
    if (total_time_spent !== undefined) {
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

  /**
   * Eliminar una tarea
   * @param {Integer} taskId - ID de la tarea
   * @returns {Boolean} - Verdadero si se eliminó, falso si no
   */
  async delete(taskId) {
    const query = `
      DELETE FROM task
      WHERE id = $1
    `;
    try {
      const res = await pool.query(query, [taskId]);
      return res.rowCount > 0;
    } catch (error) {
      console.error('Task.delete:', error.message);
      throw error;
    }
  },

  /**
   * Obtener tareas archivadas
   * @returns {Array} - Lista de tareas archivadas
   */
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

  /**
   * Obtener tareas archivadas de un usuario específico
   * @param {Integer} userId - ID del usuario
   * @returns {Array} - Lista de tareas archivadas
   */
  async getArchivedTasksByUserId(userId) {
    const query = `
      SELECT * FROM task
      WHERE archived_at IS NOT NULL AND user_id = $1
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

  /**
   * Contar todas las tareas
   * @returns {Integer} - Total de tareas
   */
  async countAll() {
    const { rows } = await pool.query('SELECT COUNT(*) FROM task');
    return parseInt(rows[0].count, 10);
  },

  /**
   * Contar todas las tareas de un usuario
   * @param {Integer} userId - ID del usuario
   * @returns {Integer} - Total de tareas del usuario
   */
  async countAllForUser(userId) {
    const { rows } = await pool.query('SELECT COUNT(*) FROM task WHERE user_id = $1', [userId]);
    return parseInt(rows[0].count, 10);
  },

  /**
   * Contar tareas por estado
   * @param {String} status - Estado de la tarea ('Completed', 'Pending', 'In Progress')
   * @returns {Integer} - Total de tareas en el estado dado
   */
  async countByStatus(status) {
    const { rows } = await pool.query('SELECT COUNT(*) FROM task WHERE status = $1', [status]);
    return parseInt(rows[0].count, 10);
  },

  /**
   * Contar tareas por estado para un usuario
   * @param {String} status - Estado de la tarea
   * @param {Integer} userId - ID del usuario
   * @returns {Integer} - Total de tareas en el estado dado para el usuario
   */
  async countByStatusForUser(status, userId) {
    const { rows } = await pool.query('SELECT COUNT(*) FROM task WHERE status = $1 AND user_id = $2', [status, userId]);
    return parseInt(rows[0].count, 10);
  },
};

module.exports = Task;
