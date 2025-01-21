// backend/src/routes/tasks.js
const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');
const authMiddleware = require('../middleware/authMiddleware');
const { body, param } = require('express-validator');

// Todas estas rutas requieren auth
router.use(authMiddleware);

// Tareas archivadas
router.get('/archived', tasksController.getArchivedTasks);

// Estadísticas
router.get('/stats', tasksController.getStats);

// Todas las tareas activas
router.get('/', tasksController.getAllTasks);

// Obtener una tarea por ID
router.get(
  '/:id',
  [param('id').isInt().withMessage('ID de tarea debe ser un número entero.')],
  tasksController.getTaskById
);

// Crear nueva tarea
router.post(
  '/',
  [
    body('name').isLength({ min: 1 }).withMessage('El nombre es obligatorio.'),
    body('description').optional().isString(),
    body('priority')
      .isIn(['Low', 'Medium', 'High'])
      .withMessage('Prioridad inválida.'),
    body('difficulty')
      .isInt({ min: 1, max: 3 })
      .withMessage('La dificultad debe ser 1, 2 o 3.'),
    body('status')
      .isIn(['Pending', 'In Progress', 'Completed'])
      .withMessage('Estado inválido.'),
    body('estimated_time')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Tiempo estimado debe ser >= 0.'),
    body('actual_time')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Tiempo real debe ser >= 0.'),
  ],
  tasksController.createTask
);

// Completar tarea
router.put(
  '/:id/complete',
  [param('id').isInt().withMessage('ID debe ser entero')],
  tasksController.completeTask
);

// Archivar tarea
router.put(
  '/:id/archive',
  [param('id').isInt().withMessage('ID debe ser entero')],
  tasksController.archiveTask
);

// Desarchivar tarea
router.put(
  '/:id/unarchive',
  [param('id').isInt().withMessage('ID debe ser entero')],
  tasksController.unarchiveTask
);

// Actualizar tarea
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('ID debe ser entero'),
    body('name')
      .optional()
      .isLength({ min: 1 })
      .withMessage('Nombre no puede estar vacío.'),
    body('description').optional().isString(),
    body('priority')
      .optional()
      .isIn(['Low', 'Medium', 'High'])
      .withMessage('Prioridad inválida.'),
    body('difficulty').optional().isInt({ min: 1, max: 3 }),
    body('status')
      .optional()
      .isIn(['Pending', 'In Progress', 'Completed', 'Archived'])
      .withMessage('Estado inválido.'),
    body('estimated_time').optional().isFloat({ min: 0 }),
    body('actual_time').optional().isFloat({ min: 0 }),
  ],
  tasksController.updateTask
);

// Eliminar tarea
router.delete(
  '/:id',
  [param('id').isInt().withMessage('ID debe ser entero')],
  tasksController.deleteTask
);

module.exports = router;
