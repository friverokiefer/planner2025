// backend/src/controllers/tasksController.js
const Task = require("../models/task");
const { validationResult } = require("express-validator");

/**
 * Función para obtener el filtro válido a partir del query string.
 * Permite los filtros "owner", "collaborator" y "all".
 */
function getFilterParam(req) {
  const validFilters = ["owner", "collaborator", "all"];
  const filter = (req.query.filter || "all").toLowerCase();
  return validFilters.includes(filter) ? filter : "all";
}

const tasksController = {
  getAllTasks: async (req, res) => {
    try {
      const filter = getFilterParam(req);
      const userId = req.user.id;
      let tasks;

      if (req.user.role === "admin") {
        tasks = await Task.getAll();
      } else {
        if (filter === "owner") {
          tasks = await Task.getAll({ userId });
        } else if (filter === "collaborator") {
          tasks = await Task.getAll({ userId, asCollaborator: true });
        } else {
          tasks = await Task.getAllOwnerOrCollaborator(userId);
        }
      }
      res.json(tasks);
    } catch (error) {
      console.error("Error al obtener tareas:", error);
      res.status(500).json({ error: "Error al obtener las tareas" });
    }
  },

  getArchivedTasks: async (req, res) => {
    try {
      let tasks;
      if (req.user.role === "admin") {
        tasks = await Task.getArchivedTasks();
      } else {
        tasks = await Task.getArchivedTasks({ userId: req.user.id });
      }
      res.json(tasks);
    } catch (error) {
      console.error("Error al obtener tareas archivadas:", error);
      res.status(500).json({ error: "Error al obtener tareas archivadas" });
    }
  },

  getTaskById: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      let task;
      if (req.user.role === "admin") {
        task = await Task.getById(req.params.id);
      } else {
        task = await Task.getByIdAndUser(req.params.id, req.user.id);
      }
      if (!task)
        return res.status(404).json({ error: "Tarea no encontrada" });
      res.json(task);
    } catch (error) {
      console.error("Error al obtener la tarea:", error);
      res.status(500).json({ error: "Error al obtener la tarea" });
    }
  },

  getTasksByPeriod: async (req, res) => {
    try {
      let { period, startDate, endDate } = req.query;
      // Si no se proporcionan startDate y endDate, calcularlos según period
      if (!startDate && !endDate && period) {
        const now = new Date();
        if (period === "today") {
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();
        } else if (period === "week") {
          const day = now.getDay();
          const diff = now.getDate() - day + (day === 0 ? -6 : 1);
          const monday = new Date(now.setDate(diff));
          monday.setHours(0, 0, 0, 0);
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);
          sunday.setHours(23, 59, 59, 999);
          startDate = monday.toISOString();
          endDate = sunday.toISOString();
        }
      }

      const userId = req.user.role === "admin" ? null : req.user.id;
      const tasks = await Task.getByPeriod({ startDate, endDate, userId });
      res.json(tasks);
    } catch (error) {
      console.error("Error al obtener tareas por período:", error);
      res.status(500).json({ error: "Error al obtener tareas por período" });
    }
  },

  createTask: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      const taskData = { ...req.body, user_id: req.user.id };
      const newTask = await Task.create(taskData);
      res.status(201).json(newTask);
    } catch (error) {
      console.error("Error al crear la tarea:", error);
      res.status(500).json({ error: "Error al crear la tarea" });
    }
  },

  completeTask: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      let task;
      if (req.user.role === "admin") {
        task = await Task.getById(req.params.id);
      } else {
        task = await Task.getByIdAndUser(req.params.id, req.user.id);
      }
      if (!task)
        return res.status(404).json({ error: "Tarea no encontrada" });
      const updatedTask = await Task.complete(req.params.id);
      res.json(updatedTask);
    } catch (error) {
      console.error("Error al completar la tarea:", error);
      res.status(500).json({ error: "Error al completar la tarea" });
    }
  },

  archiveTask: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      let task;
      if (req.user.role === "admin") {
        task = await Task.getById(req.params.id);
      } else {
        task = await Task.getByIdAndUser(req.params.id, req.user.id);
      }
      if (!task)
        return res.status(404).json({ error: "Tarea no encontrada" });
      const updatedTask = await Task.archive(req.params.id);
      res.json(updatedTask);
    } catch (error) {
      console.error("Error al archivar la tarea:", error);
      res.status(500).json({ error: "Error al archivar la tarea" });
    }
  },

  unarchiveTask: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      let task;
      if (req.user.role === "admin") {
        task = await Task.getById(req.params.id);
      } else {
        task = await Task.getByIdAndUser(req.params.id, req.user.id);
      }
      if (!task)
        return res.status(404).json({ error: "Tarea no encontrada" });
      const updatedTask = await Task.unarchive(req.params.id);
      res.json(updatedTask);
    } catch (error) {
      console.error("Error al desarchivar la tarea:", error);
      res.status(500).json({ error: "Error al desarchivar la tarea" });
    }
  },

  updateTask: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      let task;
      if (req.user.role === "admin") {
        task = await Task.getById(req.params.id);
      } else {
        task = await Task.getByIdAndUser(req.params.id, req.user.id);
      }
      if (!task)
        return res.status(404).json({ error: "Tarea no encontrada" });
      const updatedTask = await Task.update(req.params.id, req.body);
      res.json(updatedTask);
    } catch (error) {
      console.error("Error al actualizar la tarea:", error);
      res.status(500).json({ error: "Error al actualizar la tarea" });
    }
  },

  deleteTask: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      let task;
      if (req.user.role === "admin") {
        task = await Task.getById(req.params.id);
      } else {
        task = await Task.getByIdAndUser(req.params.id, req.user.id);
      }
      if (!task)
        return res.status(404).json({ error: "Tarea no encontrada" });
      await Task.delete(req.params.id);
      res.json({ message: "Tarea eliminada" });
    } catch (error) {
      console.error("Error al eliminar la tarea:", error);
      res.status(500).json({ error: "Error al eliminar la tarea" });
    }
  },

  getStats: async (req, res) => {
    try {
      const userId = req.user.id;
      const filter = getFilterParam(req);
      let totalTasks, completed, pending, inProgress, stackedData;

      if (req.user.role === "admin") {
        totalTasks = await Task.countAll();
        completed = await Task.countByStatus({ statusValue: "Completed" });
        pending = await Task.countByStatus({ statusValue: "Pending" });
        inProgress = await Task.countByStatus({ statusValue: "In Progress" });
        stackedData = await Task.getStackedPriorityDifficulty();
      } else {
        totalTasks = await Task.countAll({ userId, asCollaborator: filter === "collaborator" });
        completed = await Task.countByStatus({ statusValue: "Completed", userId, asCollaborator: filter === "collaborator" });
        pending = await Task.countByStatus({ statusValue: "Pending", userId, asCollaborator: filter === "collaborator" });
        inProgress = await Task.countByStatus({ statusValue: "In Progress", userId, asCollaborator: filter === "collaborator" });
        stackedData = await Task.getStackedPriorityDifficulty({ userId, role: filter });
      }

      res.json({ totalTasks, completed, pending, inProgress, stackedData });
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      res.status(500).json({ error: "Error al obtener estadísticas" });
    }
  },

  shareTask: async (req, res) => {
    try {
      const taskId = req.params.id;
      const { collaborator_id } = req.body;

      let task;
      if (req.user.role === "admin") {
        task = await Task.getById(taskId);
      } else {
        task = await Task.getByIdAndUser(taskId, req.user.id);
      }
      if (!task) {
        return res.status(403).json({ error: "No tienes permiso para compartir esta tarea" });
      }

      const result = await Task.shareTask(taskId, collaborator_id);
      if (!result) {
        return res.status(400).json({ error: "No se pudo asignar al colaborador (¿ya existe?)" });
      }
      res.json({ msg: "Tarea compartida con éxito", assignment: result });
    } catch (error) {
      console.error("Error al compartir la tarea:", error);
      res.status(500).json({ error: "Error al compartir la tarea" });
    }
  },

  /**
   * PUT /api/tasks/:id/add-time
   * Agrega tiempo a una tarea.
   * Se espera que el body incluya:
   *   - start_time: (string) timestamp ISO del inicio del período
   *   - end_time: (string) timestamp ISO del fin del período
   *   - comment: (opcional) texto
   */
  addTime: async (req, res) => {
    try {
      const taskId = req.params.id;
      const { start_time, end_time, comment } = req.body;

      if (!start_time || !end_time) {
        return res.status(400).json({ error: "start_time y end_time son requeridos" });
      }
      const start = new Date(start_time);
      const end = new Date(end_time);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: "Fechas inválidas" });
      }
      if (end <= start) {
        return res.status(400).json({ error: "end_time debe ser mayor que start_time" });
      }
      // La duración se calcula en horas (milisegundos a horas)
      const duration = (end - start) / 3600000;
      if (duration <= 0) {
        return res.status(400).json({ error: "La duración debe ser mayor a 0 horas" });
      }

      let task;
      if (req.user.role === "admin") {
        task = await Task.getById(taskId);
      } else {
        task = await Task.getByIdAndUser(taskId, req.user.id);
      }
      if (!task) {
        return res.status(403).json({ error: "No tienes permiso para añadir tiempo a esta tarea" });
      }

      const result = await Task.addTime(taskId, req.user.id, duration, comment);
      if (!result) {
        return res.status(400).json({ error: "No se pudo agregar el tiempo" });
      }
      res.json({ msg: "Tiempo agregado", data: result.task });
    } catch (error) {
      console.error("Error al agregar tiempo:", error);
      res.status(500).json({ error: "Error al agregar tiempo" });
    }
  },
};

module.exports = tasksController;
