// backend/src/models/task.js
const pool = require("../config/db");

/**
 * Convierte un string de intervalo (por ejemplo, '1 day 02:03:04') a horas (número decimal).
 */
function parseIntervalToHours(intervalStr) {
  if (!intervalStr) return 0;
  // Si no es string, lo convertimos
  if (typeof intervalStr !== 'string') {
    intervalStr = intervalStr.toString();
  }
  const regex = /(?:(\d+)\s*days?)?\s*(?:(\d+):(\d+):(\d+))?/;
  const match = intervalStr.match(regex);
  if (!match) return 0;
  const days = parseInt(match[1] || '0', 10);
  const hours = parseInt(match[2] || '0', 10);
  const minutes = parseInt(match[3] || '0', 10);
  const seconds = parseInt(match[4] || '0', 10);
  return days * 24 + hours + minutes / 60 + seconds / 3600;
}



const Task = {
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
    } = taskData;

    const stateValue = status || null;
    const difficultyValue = difficulty !== undefined ? String(difficulty) : null;
    const priorityValue = priority || null;

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
        '00:00:00', NOW()
      )
      RETURNING *
    `;
    const values = [
      user_id,
      title,
      description || "",
      stateValue,
      difficultyValue,
      priorityValue,
      start_date || null,
      end_date || null,
      is_active || false,
    ];

    try {
      const { rows } = await pool.query(query, values);
      const task = rows[0];
      task.total_time_spent_hours = parseIntervalToHours(task.total_time_spent);
      return task;
    } catch (error) {
      console.error("Task.create:", error.message);
      throw error;
    }
  },

  async getAll({ userId = null, asCollaborator = false } = {}) {
    let query = `SELECT t.* FROM task t`;
    const values = [];
    if (asCollaborator) {
      query += ` JOIN task_assignment ta ON t.id = ta.task_id`;
    }
    if (userId) {
      query += ` WHERE ${asCollaborator ? 'ta.user_id' : 't.user_id'} = $1`;
      values.push(userId);
      query += " AND t.archived_at IS NULL";
    } else {
      query += " WHERE t.archived_at IS NULL";
    }
    query += " ORDER BY t.created_at DESC";
    try {
      const { rows } = await pool.query(query, values);
      return rows.map(task => ({
        ...task,
        total_time_spent_hours: parseIntervalToHours(task.total_time_spent),
      }));
    } catch (error) {
      console.error("Task.getAll:", error.message);
      throw error;
    }
  },

  async getAllOwnerOrCollaborator(userId) {
    try {
      const ownerTasks = await this.getAll({ userId, asCollaborator: false });
      const collabTasks = await this.getAll({ userId, asCollaborator: true });
      const all = [...ownerTasks, ...collabTasks];
      const map = new Map();
      for (const t of all) {
        map.set(t.id, t);
      }
      return Array.from(map.values());
    } catch (error) {
      console.error("Task.getAllOwnerOrCollaborator:", error.message);
      throw error;
    }
  },

  async getById(taskId) {
    const query = `
      SELECT *
      FROM task
      WHERE id = $1
    `;
    try {
      const { rows } = await pool.query(query, [taskId]);
      if (rows.length === 0) return null;
      const task = rows[0];
      task.total_time_spent_hours = parseIntervalToHours(task.total_time_spent);
      return task;
    } catch (error) {
      console.error("Task.getById:", error.message);
      throw error;
    }
  },

  async getByIdAndUser(taskId, userId) {
    const query = `
      SELECT t.*
      FROM task t
      WHERE t.id = $1
        AND t.user_id = $2
    `;
    try {
      const { rows } = await pool.query(query, [taskId, userId]);
      if (rows.length === 0) return null;
      const task = rows[0];
      task.total_time_spent_hours = parseIntervalToHours(task.total_time_spent);
      return task;
    } catch (error) {
      console.error("Task.getByIdAndUser:", error.message);
      throw error;
    }
  },

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
      if (rows.length === 0) return null;
      const task = rows[0];
      task.total_time_spent_hours = parseIntervalToHours(task.total_time_spent);
      return task;
    } catch (error) {
      console.error("Task.complete:", error.message);
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
      if (rows.length === 0) return null;
      const task = rows[0];
      task.total_time_spent_hours = parseIntervalToHours(task.total_time_spent);
      return task;
    } catch (error) {
      console.error("Task.archive:", error.message);
      throw error;
    }
  },

  async unarchive(taskId) {
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
      if (rows.length === 0) return null;
      const task = rows[0];
      task.total_time_spent_hours = parseIntervalToHours(task.total_time_spent);
      return task;
    } catch (error) {
      console.error("Task.unarchive:", error.message);
      throw error;
    }
  },

  async update(taskId, updateData) {
    const {
      title,
      description,
      state,
      difficulty,
      priority,
      start_date,
      end_date,
      is_active,
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
    if (state !== undefined) {
      fields.push(`state = $${index++}`);
      values.push(state);
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
    if (fields.length === 0) {
      const existing = await this.getById(taskId);
      return existing;
    }
    const query = `
      UPDATE task
      SET ${fields.join(", ")}, updated_at = NOW()
      WHERE id = $${index}
      RETURNING *
    `;
    values.push(taskId);
    try {
      const { rows } = await pool.query(query, values);
      if (rows.length === 0) return null;
      const task = rows[0];
      task.total_time_spent_hours = parseIntervalToHours(task.total_time_spent);
      return task;
    } catch (error) {
      console.error("Task.update:", error.message);
      throw error;
    }
  },

  async delete(taskId) {
    const query = `
      DELETE FROM task
      WHERE id = $1
    `;
    try {
      const res = await pool.query(query, [taskId]);
      return res.rowCount > 0;
    } catch (error) {
      console.error("Task.delete:", error.message);
      throw error;
    }
  },

  async getArchivedTasks({ userId = null } = {}) {
    let query = `
      SELECT t.*
      FROM task t
      WHERE t.archived_at IS NOT NULL
    `;
    const values = [];
    if (userId) {
      query += ` AND t.user_id = $1`;
      values.push(userId);
    }
    query += ` ORDER BY t.archived_at DESC`;
    try {
      const { rows } = await pool.query(query, values);
      return rows.map(task => ({
        ...task,
        total_time_spent_hours: parseIntervalToHours(task.total_time_spent),
      }));
    } catch (error) {
      console.error("Task.getArchivedTasks:", error.message);
      throw error;
    }
  },

  async shareTask(taskId, collaboratorId) {
    try {
      const query = `
        INSERT INTO task_assignment (task_id, user_id, role, created_at)
        VALUES ($1, $2, 'collaborator', NOW())
        ON CONFLICT (task_id, user_id) DO NOTHING
        RETURNING id, task_id, user_id, role
      `;
      const values = [taskId, collaboratorId];
      const { rows } = await pool.query(query, values);
      return rows[0] || null;
    } catch (error) {
      console.error("Task.shareTask:", error.message);
      return null;
    }
  },

  async countAll({ userId = null, asCollaborator = false } = {}) {
    let query = `SELECT COUNT(DISTINCT t.id) AS cnt FROM task t`;
    const values = [];
    if (asCollaborator) {
      query += ` JOIN task_assignment ta ON t.id = ta.task_id WHERE ta.user_id = $1`;
      values.push(userId);
    } else if (userId) {
      query += ` WHERE t.user_id = $1`;
      values.push(userId);
    }
    try {
      const { rows } = await pool.query(query, values);
      return parseInt(rows[0].cnt, 10);
    } catch (error) {
      console.error("Task.countAll:", error.message);
      throw error;
    }
  },

  async countByStatus({ statusValue, userId = null, asCollaborator = false } = {}) {
    let query = `SELECT COUNT(DISTINCT t.id) AS cnt FROM task t`;
    const values = [statusValue];
    const conditions = [`t.state = $1`];
    if (asCollaborator) {
      query += ` JOIN task_assignment ta ON t.id = ta.task_id`;
      conditions.push(`ta.user_id = $${values.length + 1}`);
      values.push(userId);
    } else if (userId) {
      conditions.push(`t.user_id = $${values.length + 1}`);
      values.push(userId);
    }
    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(" AND ");
    }
    try {
      const { rows } = await pool.query(query, values);
      return parseInt(rows[0].cnt, 10);
    } catch (error) {
      console.error("Task.countByStatus:", error.message);
      throw error;
    }
  },

  async getStackedPriorityDifficulty({ userId = null, role = 'all' } = {}) {
    let query = "SELECT t.priority, t.difficulty, COUNT(*) as count FROM task t";
    const values = [];
    const conditions = [];
    if (role === 'collaborator') {
      query += " JOIN task_assignment ta ON t.id = ta.task_id";
      conditions.push("ta.user_id = $1");
      values.push(userId);
    } else if (role === 'owner') {
      conditions.push("t.user_id = $1");
      values.push(userId);
    } else if (userId) {
      query += " LEFT JOIN task_assignment ta ON t.id = ta.task_id";
      conditions.push("(t.user_id = $1 OR ta.user_id = $1)");
      values.push(userId);
    }
    conditions.push("t.priority IS NOT NULL", "t.difficulty IS NOT NULL");
    if (conditions.length) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " GROUP BY t.priority, t.difficulty ORDER BY t.priority, t.difficulty";
    console.log('Consulta SQL:', query);
    try {
      const { rows } = await pool.query(query, values);
      return rows;
    } catch (error) {
      console.error("Task.getStackedPriorityDifficulty:", error.message);
      throw error;
    }
  },

  async addTime(taskId, userId, durationHrs, comment) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const insertTimeTrackQuery = `
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
      const insertTimeTrackValues = [taskId, userId, durationHrs, comment || ""];
      const { rows: timeTrackRows } = await client.query(insertTimeTrackQuery, insertTimeTrackValues);
      if (timeTrackRows.length === 0) {
        throw new Error("No se pudo insertar el tiempo en time_track");
      }
      const updateTaskQuery = `
        UPDATE task
        SET total_time_spent = total_time_spent + ($1 * INTERVAL '1 hour'),
            updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `;
      const updateTaskValues = [durationHrs, taskId];
      const { rows: taskRows } = await client.query(updateTaskQuery, updateTaskValues);
      if (taskRows.length === 0) {
        throw new Error("No se pudo actualizar el total_time_spent en task");
      }
      await client.query('COMMIT');
      const updatedTask = taskRows[0];
      updatedTask.total_time_spent_hours = parseIntervalToHours(updatedTask.total_time_spent);
      return { timeTrack: timeTrackRows[0], task: updatedTask };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Task.addTime:", error.message);
      return null;
    } finally {
      client.release();
    }
  },

  async getByPeriod({ startDate, endDate, userId = null } = {}) {
    let query = "SELECT t.* FROM task t WHERE t.archived_at IS NULL";
    const values = [];
    if (startDate) {
      query += " AND t.start_date >= $" + (values.length + 1);
      values.push(startDate);
    }
    if (endDate) {
      query += " AND t.start_date <= $" + (values.length + 1);
      values.push(endDate);
    }
    if (userId) {
      query += " AND t.user_id = $" + (values.length + 1);
      values.push(userId);
    }
    query += " ORDER BY t.created_at DESC";
    try {
      const { rows } = await pool.query(query, values);
      return rows.map(task => ({
        ...task,
        total_time_spent_hours: parseIntervalToHours(task.total_time_spent),
      }));
    } catch (error) {
      console.error("Task.getByPeriod:", error.message);
      throw error;
    }
  },
};

module.exports = Task;
