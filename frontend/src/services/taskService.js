// frontend/src/services/taskService.js
import axiosInstance from './axiosInstance';

// Obtener todas las tareas
export const getTasks = () => {
  return axiosInstance.get('/tasks');
};

// Obtener tareas filtradas por período (usa period, startDate y endDate)
export const getTasksByPeriod = (period, startDate, endDate) => {
  return axiosInstance.get('/tasks/filter', { 
    params: { period, startDate, endDate } 
  });
};

// Actualizar una tarea
export const updateTask = (taskId, updatedTask) => {
  return axiosInstance.put(`/tasks/${taskId}`, updatedTask);
};

// Crear una nueva tarea
export const createTask = taskData => {
  return axiosInstance.post('/tasks', taskData);
};

// Eliminar una tarea
export const deleteTask = taskId => {
  return axiosInstance.delete(`/tasks/${taskId}`);
};

// Agregar tiempo a una tarea: se envía un objeto con start_time, end_time y comment
export const addTimeToTask = (taskId, start_time, end_time, comment) => {
  return axiosInstance.put(`/tasks/${taskId}/add-time`, { start_time, end_time, comment });
};

export default {
  getTasks,
  getTasksByPeriod,
  updateTask,
  createTask,
  deleteTask,
  addTimeToTask,
};
