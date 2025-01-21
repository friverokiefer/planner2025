// backend/src/controllers/tasksController.js
const Task = require('../models/task');
const { validationResult } = require('express-validator');

const tasksController = {
  // Obtener todas las tareas (no archivadas)
  getAllTasks: async (req, res) => {
    try {
      // req.user viene del authMiddleware con { id, role, ... }
      let tasks;
      if (req.user.role === 'admin') {
        tasks = await Task.getAll(); 
      } else {
        tasks = await Task.getAllByUserId(req.user.id);
      }
      res.json(tasks);
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      res.status(500).json({ error: 'Error al obtener las tareas' });
    }
  },

  // Obtener tareas archivadas
  getArchivedTasks: async (req, res) => {
    try {
      let tasks;
      if (req.user.role === 'admin') {
        tasks = await Task.getArchivedTasks();
      } else {
        tasks = await Task.getArchivedTasksByUserId(req.user.id);
      }
      res.json(tasks);
    } catch (error) {
      console.error('Error al obtener tareas archivadas:', error);
      res.status(500).json({ error: 'Error al obtener tareas archivadas' });
    }
  },

  // Obtener una tarea concreta por ID
  getTaskById: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let task;
      if (req.user.role === 'admin') {
        task = await Task.getById(req.params.id);
      } else {
        task = await Task.getByIdAndUser(req.params.id, req.user.id);
      }

      if (!task) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }
      res.json(task);
    } catch (error) {
      console.error('Error al obtener la tarea:', error);
      res.status(500).json({ error: 'Error al obtener la tarea' });
    }
  },

  // Crear una nueva tarea
  createTask: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Asignar user_id al body para forzar que la tarea sea del usuario logueado
      const taskData = {
        ...req.body,
        user_id: req.user.id,
      };
      const newTask = await Task.create(taskData);
      return res.status(201).json(newTask);
    } catch (error) {
      console.error('Error al crear la tarea:', error);
      res.status(500).json({ error: 'Error al crear la tarea' });
    }
  },

  // Completar una tarea (status => 'Completed')
  completeTask: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let task;
      if (req.user.role === 'admin') {
        task = await Task.getById(req.params.id);
      } else {
        task = await Task.getByIdAndUser(req.params.id, req.user.id);
      }
      if (!task) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }
      const updatedTask = await Task.complete(req.params.id);
      res.json(updatedTask);
    } catch (error) {
      console.error('Error al completar la tarea:', error);
      res.status(500).json({ error: 'Error al completar la tarea' });
    }
  },

  // Archivar una tarea (status => 'Archived')
  archiveTask: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let task;
      if (req.user.role === 'admin') {
        task = await Task.getById(req.params.id);
      } else {
        task = await Task.getByIdAndUser(req.params.id, req.user.id);
      }
      if (!task) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }
      const updatedTask = await Task.archive(req.params.id);
      res.json(updatedTask);
    } catch (error) {
      console.error('Error al archivar la tarea:', error);
      res.status(500).json({ error: 'Error al archivar la tarea' });
    }
  },

  // Desarchivar una tarea (status => 'Pending')
  unarchiveTask: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let task;
      if (req.user.role === 'admin') {
        task = await Task.getById(req.params.id);
      } else {
        task = await Task.getByIdAndUser(req.params.id, req.user.id);
      }
      if (!task) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }
      const updatedTask = await Task.unarchive(req.params.id);
      res.json(updatedTask);
    } catch (error) {
      console.error('Error al desarchivar la tarea:', error);
      res.status(500).json({ error: 'Error al desarchivar la tarea' });
    }
  },

  // Actualizar una tarea
  updateTask: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let task;
      if (req.user.role === 'admin') {
        task = await Task.getById(req.params.id);
      } else {
        task = await Task.getByIdAndUser(req.params.id, req.user.id);
      }
      if (!task) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }

      const updatedTask = await Task.update(req.params.id, req.body);
      res.json(updatedTask);
    } catch (error) {
      console.error('Error al actualizar la tarea:', error);
      res.status(500).json({ error: 'Error al actualizar la tarea' });
    }
  },

  // Eliminar una tarea
  deleteTask: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let task;
      if (req.user.role === 'admin') {
        task = await Task.getById(req.params.id);
      } else {
        task = await Task.getByIdAndUser(req.params.id, req.user.id);
      }
      if (!task) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }

      await Task.delete(req.params.id);
      res.json({ message: 'Tarea eliminada' });
    } catch (error) {
      console.error('Error al eliminar la tarea:', error);
      res.status(500).json({ error: 'Error al eliminar la tarea' });
    }
  },

  /**
   * Estadísticas. Devuelve un JSON con:
   *  {
   *    totalTasks,
   *    completed,
   *    pending,
   *    inProgress
   *  }
   *  Si quieres un stacked chart, necesitarás un group by (priority,difficulty).
   */
  getStats: async (req, res) => {
    try {
      let totalTasks, completed, pending, inProgress;

      if (req.user.role === 'admin') {
        totalTasks = await Task.countAll();
        completed = await Task.countByStatus('Completed');
        pending = await Task.countByStatus('Pending');
        inProgress = await Task.countByStatus('In Progress');
      } else {
        totalTasks = await Task.countAllForUser(req.user.id);
        completed = await Task.countByStatusForUser('Completed', req.user.id);
        pending = await Task.countByStatusForUser('Pending', req.user.id);
        inProgress = await Task.countByStatusForUser('In Progress', req.user.id);
      }

      // EJEMPLO: Si deseas stackedData (priority vs difficulty),
      // deberías hacer un método en Task que agrupe y devuelva 
      // { priority, difficulty, total }. Lo omito aquí por brevedad.

      // Devolvemos el JSON (compatible con tu TaskMetricsPage actual)
      return res.json({
        totalTasks,
        completed,
        pending,
        inProgress,
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  },
};

module.exports = tasksController;
