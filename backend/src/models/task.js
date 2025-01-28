// backend/src/models/task.js
const pool = require('../config/db');

const Task = {
  /**
   * Crear una nueva tarea
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
      // total_time_spent => OPCIONAL, si existiera
    } = taskData;

    // Mapeos
    const stateValue = status || null;
    const difficultyValue = (difficulty !== undefined) ? String(difficulty) : null;
    const priorityValue = priority || null;

    // (*) total_time_spent ya no es recomendable con Estrategia 1
    // pero si sigue existiendo en la BD, lo inicializamos con '00:00:00'
    const query = `
      INSERT INTO task (
        user_id, title, description,
        state, difficulty, priority,
        start_date, end_date, is_active,
        total_time_spent, created_at
      )
      VALUES (
        $1, $2, $3,
        $4, $5, $6,
        $7, $8, $9,
        '00:00:00', now()
      )
      RETURNING *
    `;
    const values = [
      user_id,
      title,
      description || '',
      stateValue,
      difficultyValue,
      priorityValue,
      start_date || null,
      end_date || null,
      is_active || false,
    ];

    try {
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Task.create:', error.message);
      throw error;
    }
  },

  // --------------------------------------------------------------------------
  // Métodos de obtención
  // --------------------------------------------------------------------------
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

  // Si implementas "task_assignment" real, rellena:
  async getAllAsCollaborator(userId) {
    // Ejemplo real:
    // SELECT t.* FROM task t
    // JOIN task_assignment ta ON t.id = ta.task_id
    // WHERE ta.user_id = $1 AND ta.role='collaborator'
    // AND t.archived_at IS NULL
    return [];
  },

  async getAllOwnerOrCollaborator(userId) {
    const ownerTasks = await this.getAllByUserId(userId);
    const collabTasks = await this.getAllAsCollaborator(userId);

    const all = [...ownerTasks, ...collabTasks];
    const map = new Map();
    for (const t of all) {
      map.set(t.id, t);
    }
    return Array.from(map.values());
  },

  async getById(taskId) {
    const query = `SELECT * FROM task WHERE id = $1`;
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

  // --------------------------------------------------------------------------
  // Completar, Archivar, Desarchivar
  // --------------------------------------------------------------------------
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

  async unarchive(taskId) {
    // (*) Ajuste para volver a 'Pending' cuando se desarchiva
    const query = `
      UPDATE task
      SET
        archived_at = NULL,
        state = 'Pending',
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

  // --------------------------------------------------------------------------
  // Actualizar
  // --------------------------------------------------------------------------
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
      // total_time_spent => OJO si lo usas
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

    // Opcional: si quieres seguir soportando total_time_spent
    // Pero con Estrategia 1 no es tan necesario
    // if (total_time_spent !== undefined) {
    //   fields.push(`total_time_spent = total_time_spent + $${index++}`);
    //   values.push(total_time_spent);
    // }

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

  // --------------------------------------------------------------------------
  // Tareas Archivadas
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // shareTask => si usas task_assignment
  // --------------------------------------------------------------------------
  async shareTask(taskId, collaboratorId) {
    // tu lógica real, p.ej:
    // INSERT INTO task_assignment(task_id, user_id, role) VALUES(...)
    // RETURNING ...
    return null;
  },

  // --------------------------------------------------------------------------
  // Métodos "dummy" para evitar error 500 en countAll, etc.
  // --------------------------------------------------------------------------
  async countAll() {
    const query = `SELECT COUNT(*) AS cnt FROM task`;
    const { rows } = await pool.query(query);
    return parseInt(rows[0].cnt, 10);
  },

  async countByStatus(statusValue) {
    const query = `SELECT COUNT(*) AS cnt FROM task WHERE state = $1`;
    const { rows } = await pool.query(query, [statusValue]);
    return parseInt(rows[0].cnt, 10);
  },

  async countAllForUser(userId) {
    const query = `SELECT COUNT(*) AS cnt FROM task WHERE user_id = $1`;
    const { rows } = await pool.query(query, [userId]);
    return parseInt(rows[0].cnt, 10);
  },

  async countByStatusForUser(statusValue, userId) {
    const query = `SELECT COUNT(*) AS cnt FROM task WHERE state = $1 AND user_id = $2`;
    const { rows } = await pool.query(query, [statusValue, userId]);
    return parseInt(rows[0].cnt, 10);
  },

  async getStackedPriorityDifficultyAll() {
    // Devuelve array con { priority, difficulty_1, difficulty_2, ...}
    // Ejemplo ficticio:
    return [];
  },

  async getStackedPriorityDifficultyByUser(userId) {
    // Devuelve array con { priority, difficulty_1, ...} para un user
    return [];
  },

  // --------------------------------------------------------------------------
  // addTime: Insertar en la tabla time_track
  // --------------------------------------------------------------------------
  async addTime(taskId, userId, durationHrs, comment) {
    // Queremos insertar un registro en time_track,
    // asumiendo que "durationHrs" es un número de horas en decimal.
    // Generamos un "start_time" y "end_time" ficticio, o guardamos sólo end_time.
    // Aquí simulo: end_time = now(), start_time = now() - durationHrs
    // y guardamos el comment
    const insertQuery = `
      INSERT INTO time_track (
        task_id, user_id,
        start_time, end_time,
        comment,
        created_at
      )
      VALUES (
        $1, $2,
        NOW() - ($3 * INTERVAL '1 hour'),
        NOW(),
        $4,
        NOW()
      )
      RETURNING *
    `;
    const values = [taskId, userId, durationHrs, comment || ''];

    try {
      const { rows } = await pool.query(insertQuery, values);
      return rows[0];
    } catch (error) {
      console.error('Task.addTime:', error);
      return null;
    }
  },
};

module.exports = Task;
