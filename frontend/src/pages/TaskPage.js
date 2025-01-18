// ./frontend/src/pages/TaskPage.js
import React, { useState, useEffect } from 'react';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import './TaskPage.css';
import { Alert } from 'react-bootstrap';

function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks'); // URL relativa gracias al proxy
      if (!response.ok) {
        throw new Error('Error al obtener las tareas');
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error('Error al obtener las tareas:', err);
      setError('Error al obtener las tareas');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="task-page">
      <h2>Gestor de Tareas</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}
      <div className="task-layout">
        <div className="task-form-column">
          <TaskForm onTaskAdded={(newTask) => {
            setTasks((prev) => [newTask, ...prev]);
            setMessage('¡Tarea agregada exitosamente!');
            setTimeout(() => setMessage(''), 3000);
          }} />
        </div>
        <div className="task-list-column">
          <TaskList tasks={tasks} setTasks={setTasks} />
        </div>
      </div>
    </div>
  );
}

export default TaskPage;
