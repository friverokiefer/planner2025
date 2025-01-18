// frontend/src/components/TaskForm.js
import React, { useState } from 'react';
import './TaskForm.css';
import useSound from '../hooks/useSound';
import addTaskSound from '../assets/sounds/notification-1-269296.mp3';
import { Form, Button } from 'react-bootstrap';
import { FaEdit, FaClock, FaCalendar, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

function TaskForm({ onTaskAdded }) {
  const [task, setTask] = useState({
    name: '',
    description: '',
    priority: 'Low',
    difficulty: 1,
    status: 'Pending',
    estimated_time: '',
  });
  const [message, setMessage] = useState('');
  const playAddSound = useSound(addTaskSound);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'difficulty') {
      newValue = parseInt(value, 10);
    } else if (name === 'estimated_time') {
      newValue = value === '' ? '' : parseFloat(value);
    }

    setTask({ ...task, [name]: newValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });

      if (response.ok) {
        const newTask = await response.json();
        onTaskAdded(newTask);
        playAddSound();
        setTask({
          name: '',
          description: '',
          priority: 'Low',
          difficulty: 1,
          status: 'Pending',
          estimated_time: '',
        });
        setMessage('¡Tarea agregada exitosamente!');
        setTimeout(() => setMessage(''), 5000); // Limpiar mensaje después de 5 segundos
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Fallo al agregar la tarea.');
      }
    } catch (error) {
      console.error('Error al agregar tarea:', error);
      setMessage('Ocurrió un error al agregar la tarea.');
    }
  };

  return (
    <Form className="task-form" onSubmit={handleSubmit}>
      <h2 className="form-title">
        <FaEdit /> Agregar Nueva Tarea
      </h2>
      {message && (
        <div className={`message ${message.includes('exitosamente') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      <Form.Group>
        <Form.Label><FaEdit /> Nombre:</Form.Label>
        <Form.Control
          type="text"
          name="name"
          value={task.name}
          onChange={handleChange}
          required
          placeholder="Ingrese el nombre de la tarea"
        />
      </Form.Group>
      <Form.Group>
        <Form.Label><FaEdit /> Descripción:</Form.Label>
        <Form.Control
          as="textarea"
          name="description"
          value={task.description}
          onChange={handleChange}
          placeholder="Ingrese la descripción de la tarea"
        />
      </Form.Group>
      <Form.Group>
        <Form.Label><FaExclamationCircle /> Prioridad:</Form.Label>
        <Form.Control
          as="select"
          name="priority"
          value={task.priority}
          onChange={handleChange}
          className={`priority-dropdown priority-${task.priority.toLowerCase()}`}
        >
          <option value="Low">Baja</option>
          <option value="Medium">Media</option>
          <option value="High">Alta</option>
        </Form.Control>
      </Form.Group>
      <Form.Group>
        <Form.Label><FaExclamationCircle /> Dificultad:</Form.Label>
        <Form.Control
          as="select"
          name="difficulty"
          value={task.difficulty}
          onChange={handleChange}
          className={`difficulty-dropdown difficulty-${task.difficulty}`}
        >
          <option value={1}>1 - Fácil</option>
          <option value={2}>2 - Medio</option>
          <option value={3}>3 - Difícil</option>
        </Form.Control>
      </Form.Group>
      <Form.Group>
        <Form.Label><FaCheckCircle /> Estado:</Form.Label>
        <Form.Control
          as="select"
          name="status"
          value={task.status}
          onChange={handleChange}
          className={`status-dropdown status-${task.status.toLowerCase().replace(' ', '-')}`}
        >
          <option value="Pending">Pendiente</option>
          <option value="In Progress">En Progreso</option>
          <option value="Completed">Completado</option>
        </Form.Control>
      </Form.Group>
      <Form.Group>
        <Form.Label><FaClock /> Tiempo Estimado (horas):</Form.Label>
        <Form.Control
          type="number"
          name="estimated_time"
          value={task.estimated_time}
          onChange={handleChange}
          min="0"
          step="0.5"
          placeholder="Horas estimadas"
        />
      </Form.Group>
      <Button type="submit" variant="success" className="add-task-button">
        Agregar Tarea
      </Button>
    </Form>
  );
}

export default TaskForm;