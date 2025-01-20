// --- backend/src/routes/tasks.js ---
const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');
const authMiddleware = require('../middleware/authMiddleware');
const { body, param } = require('express-validator');

// Tareas archivadas
router.get('/archived', authMiddleware, tasksController.getArchivedTasks);

// Estadísticas de tareas
router.get('/stats', authMiddleware, tasksController.getStats);

// Todas las tareas activas (no archivadas)
router.get('/', authMiddleware, tasksController.getAllTasks);

// Obtener una tarea por ID
router.get('/:id',
  authMiddleware,
  [param('id').isInt().withMessage('ID de tarea debe ser un número entero.')],
  tasksController.getTaskById
);

// Crear una nueva tarea
router.post('/',
  authMiddleware,
  [
    body('name').isLength({ min: 1 }).withMessage('El nombre es obligatorio.'),
    body('description').optional().isString(),
    body('priority').isIn(['Low', 'Medium', 'High']).withMessage('Prioridad inválida.'),
    body('difficulty').isInt({ min: 1, max: 3 }).withMessage('La dificultad debe ser 1, 2 o 3.'),
    body('status').isIn(['Pending', 'In Progress', 'Completed']).withMessage('Estado inválido.'),
    body('estimated_time').optional().isFloat({ min: 0 }).withMessage('Tiempo estimado debe ser >= 0.'),
    body('actual_time').optional().isFloat({ min: 0 }).withMessage('Tiempo real debe ser >= 0.')
  ],
  tasksController.createTask
);

// Completar una tarea
router.put('/:id/complete',
  authMiddleware,
  [param('id').isInt().withMessage('ID debe ser entero')],
  tasksController.completeTask
);

// Archivar una tarea
router.put('/:id/archive',
  authMiddleware,
  [param('id').isInt().withMessage('ID debe ser entero')],
  tasksController.archiveTask
);

// Desarchivar una tarea
router.put('/:id/unarchive',
  authMiddleware,
  [param('id').isInt().withMessage('ID debe ser entero')],
  tasksController.unarchiveTask
);

// Actualizar tarea
router.put('/:id',
  authMiddleware,
  [
    param('id').isInt().withMessage('ID debe ser entero'),
    body('name').optional().isLength({ min: 1 }).withMessage('Nombre no puede estar vacío.'),
    body('description').optional().isString(),
    body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Prioridad inválida.'),
    body('difficulty').optional().isInt({ min: 1, max: 3 }),
    body('status').optional().isIn(['Pending', 'In Progress', 'Completed', 'Archived']).withMessage('Estado inválido.'),
    body('estimated_time').optional().isFloat({ min: 0 }),
    body('actual_time').optional().isFloat({ min: 0 })
  ],
  tasksController.updateTask
);

// Eliminar tarea
router.delete('/:id',
  authMiddleware,
  [param('id').isInt().withMessage('ID debe ser entero')],
  tasksController.deleteTask
);

module.exports = router;
