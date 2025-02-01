// backend/src/routes/tasksAdvanced.js
const express = require("express");
const router = express.Router();
const tasksAdvancedController = require("../controllers/tasksAdvancedController");
const authMiddleware = require("../middleware/authMiddleware");

// Proteger las rutas con el middleware de autenticación
router.use(authMiddleware);

// Obtener todas las tareas del usuario (propietario o colaborador)
router.get("/", tasksAdvancedController.getAllTasks);

// Obtener tareas filtradas por periodo
router.get("/period", tasksAdvancedController.getTasksByPeriod);

// Crear una nueva tarea
router.post("/", tasksAdvancedController.createTask);

// Actualizar una tarea
router.put("/:id", tasksAdvancedController.updateTask);

// Eliminar una tarea
router.delete("/:id", tasksAdvancedController.deleteTask);

module.exports = router;