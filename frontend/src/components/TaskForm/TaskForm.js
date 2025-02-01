// frontend/src/components/TaskForm/TaskForm.js

import { useState } from 'react';
import PropTypes from 'prop-types';
import './TaskForm.css';
import useSound from '../../hooks/useSound';
import addTaskSound from '../../assets/sounds/notification-1-269296.mp3';
import { Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import {
  FaEdit,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
} from 'react-icons/fa';
import authService from '../../services/authService';

function TaskForm({ onTaskAdded }) {
  const [task, setTask] = useState({
    title: '',
    description: '',
    priority: 'Low',
    difficulty: 1,
    status: 'Pending',
    estimated_time: '',
    start_date: '',
    end_date: '',
  });
  const [enableEndDate, setEnableEndDate] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const playAddSound = useSound(addTaskSound);

  const handleChange = e => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'difficulty') {
      newValue = parseInt(value, 10);
    } else if (name === 'estimated_time') {
      newValue = value === '' ? '' : parseFloat(value);
    }
    setTask({ ...task, [name]: newValue });
  };

  const handleToggleEndDate = () => {
    setEnableEndDate(prev => !prev);
    // Al desactivar el switch, limpiamos el end_date
    if (enableEndDate) {
      setTask(prev => ({ ...prev, end_date: '' }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage('');

    if (!task.title.trim()) {
      setError('El título de la tarea es obligatorio.');
      setLoading(false);
      return;
    }

    // Validar que la fecha de fin no sea anterior a la fecha de inicio
    if (task.start_date && task.end_date) {
      if (new Date(task.end_date) < new Date(task.start_date)) {
        setError('La fecha de fin no puede ser anterior a la fecha de inicio.');
        setLoading(false);
        return;
      }
    }

    try {
      const user = authService.getCurrentUser();
      if (!user || !user.token) {
        setError('No hay usuario autenticado.');
        setLoading(false);
        return;
      }

      // Si no está habilitada la fecha de fin, la limpiamos antes de enviar
      const finalTaskData = { ...task };
      if (!enableEndDate) {
        finalTaskData.end_date = '';
      }

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(finalTaskData),
      });

      if (response.ok) {
        const newTask = await response.json();
        onTaskAdded(newTask);
        // Resetear formulario y switch
        setTask({
          title: '',
          description: '',
          priority: 'Low',
          difficulty: 1,
          status: 'Pending',
          estimated_time: '',
          start_date: '',
          end_date: '',
        });
        setEnableEndDate(false);
        playAddSound();
        setMessage('Tarea agregada exitosamente.');
      } else {
        const errorData = await response.json();
        if (errorData.error) {
          setError(errorData.error);
        } else if (response.status === 400) {
          setError('Datos inválidos. Revisa los campos.');
        } else {
          setError('Fallo al agregar la tarea.');
        }
      }
    } catch (error) {
      console.error('Error al agregar tarea:', error);
      setError('Ocurrió un error al agregar la tarea.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form className="task-form" onSubmit={handleSubmit}>
      <h2 className="form-title">
        <FaEdit /> Agregar Nueva Tarea
      </h2>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* TÍTULO */}
      <Form.Group>
        <Form.Label>
          <FaEdit /> Título:
        </Form.Label>
        <Form.Control
          type="text"
          name="title"
          value={task.title}
          onChange={handleChange}
          required
          placeholder="Ingrese el título de la tarea"
        />
      </Form.Group>

      {/* DESCRIPCIÓN */}
      <Form.Group>
        <Form.Label>
          <FaEdit /> Descripción:
        </Form.Label>
        <Form.Control
          as="textarea"
          name="description"
          value={task.description}
          onChange={handleChange}
          placeholder="Ingrese la descripción de la tarea"
        />
      </Form.Group>

      {/* PRIORIDAD */}
      <Form.Group>
        <Form.Label>
          <FaExclamationCircle /> Prioridad:
        </Form.Label>
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

      {/* DIFICULTAD */}
      <Form.Group>
        <Form.Label>
          <FaExclamationCircle /> Dificultad:
        </Form.Label>
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

      {/* ESTADO */}
      <Form.Group>
        <Form.Label>
          <FaCheckCircle /> Estado:
        </Form.Label>
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

      {/* TIEMPO ESTIMADO */}
      <Form.Group>
        <Form.Label>
          <FaClock /> Tiempo Estimado (horas):
        </Form.Label>
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

      {/* FECHAS */}
      <Row className="mt-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Fecha de Inicio:</Form.Label>
            <Form.Control
              type="date"
              name="start_date"
              value={task.start_date}
              onChange={handleChange}
              placeholder="dd-mm-yyyy"
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          {/* Switch para activar/desactivar la fecha de fin */}
          <Form.Group>
            <Form.Label>Activar Fecha de Fin:</Form.Label>
            <Form.Check
              type="switch"
              id="enable-end-date-switch"
              label="Sí"
              checked={enableEndDate}
              onChange={handleToggleEndDate}
              className="mb-2"
            />
          </Form.Group>

          {/* Al activar el switch, aparece el campo para la fecha de fin */}
          {enableEndDate && (
            <Form.Group>
              <Form.Label>Fecha de Fin:</Form.Label>
              <Form.Control
                type="date"
                name="end_date"
                value={task.end_date}
                onChange={handleChange}
                placeholder="dd-mm-yyyy"
              />
            </Form.Group>
          )}
        </Col>
      </Row>

      <Button
        type="submit"
        variant="success"
        className="add-task-button mt-3"
        disabled={loading || !task.title}
      >
        {loading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />{' '}
            Agregando...
          </>
        ) : (
          'Agregar Tarea'
        )}
      </Button>
    </Form>
  );
}

TaskForm.propTypes = {
  onTaskAdded: PropTypes.func.isRequired,
};

export default TaskForm;
