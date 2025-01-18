// backend/src/controllers/tasksController.js
const Task = require('../models/task');
const { validationResult } = require('express-validator');

const tasksController = {
  // Obtener todas las tareas no archivadas
  getAllTasks: async (req, res) => {
    try {
      const tasks = await Task.getAll();
      res.json(tasks);
    } catch (error) {
      console.error('Error al obtener las tareas:', error);
      res.status(500).json({ error: 'Error al obtener las tareas' });
    }
  },

  // Obtener una tarea por ID
  getTaskById: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const task = await Task.getById(req.params.id);
      if (task) {
        res.json(task);
      } else {
        res.status(404).json({ error: 'Tarea no encontrada' });
      }
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
      const newTask = await Task.create(req.body);
      res.status(201).json(newTask);
    } catch (error) {
      console.error('Error al crear la tarea:', error);
      res.status(500).json({ error: 'Error al crear la tarea' });
    }
  },

  // Completar una tarea
  completeTask: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updatedTask = await Task.complete(req.params.id);
      if (updatedTask) {
        res.json(updatedTask);
      } else {
        res.status(404).json({ error: 'Tarea no encontrada' });
      }
    } catch (error) {
      console.error('Error al completar la tarea:', error);
      res.status(500).json({ error: 'Error al completar la tarea' });
    }
  },

  // Archivar una tarea
  archiveTask: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updatedTask = await Task.archive(req.params.id);
      if (updatedTask) {
        res.json(updatedTask);
      } else {
        res.status(404).json({ error: 'Tarea no encontrada para archivar' });
      }
    } catch (error) {
      console.error('Error al archivar la tarea:', error);
      res.status(500).json({ error: 'Error al archivar la tarea' });
    }
  },

  // Desarchivar una tarea
  unarchiveTask: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updatedTask = await Task.unarchive(req.params.id);
      if (updatedTask) {
        res.json(updatedTask);
      } else {
        res.status(404).json({ error: 'Tarea no encontrada para desarchivar' });
      }
    } catch (error) {
      console.error('Error al desarchivar la tarea:', error);
      res.status(500).json({ error: 'Error al desarchivar la tarea' });
    }
  },

  // Actualizar una tarea existente
  updateTask: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updatedTask = await Task.update(req.params.id, req.body);
      if (updatedTask) {
        res.json(updatedTask);
      } else {
        res.status(404).json({ error: 'Tarea no encontrada' });
      }
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
      await Task.delete(req.params.id);
      res.json({ message: 'Tarea eliminada' });
    } catch (error) {
      console.error('Error al eliminar la tarea:', error);
      res.status(500).json({ error: 'Error al eliminar la tarea' });
    }
  },

  // Obtener estadísticas de tareas
  getStats: async (req, res) => {
    try {
      const totalTasks = await Task.countAll();
      const completed = await Task.countByStatus('Completed');
      const pending = await Task.countByStatus('Pending');
      const inProgress = await Task.countByStatus('In Progress');
      const priorityDistribution = await Task.getDifficultyByPriority(); // Llama a la función correcta

      res.json({
        totalTasks,
        completed,
        pending,
        inProgress,
        priorityDistribution,
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  },

  // Obtener tareas archivadas
  getArchivedTasks: async (req, res) => {
    try {
      const archivedTasks = await Task.getArchivedTasks();
      res.json(archivedTasks);
    } catch (error) {
      console.error('Error al obtener tareas archivadas:', error);
      res.status(500).json({ error: 'Error al obtener tareas archivadas' });
    }
  },
};

module.exports = tasksController;