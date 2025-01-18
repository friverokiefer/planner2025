// frontend/src/components/EditTaskModal.js

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import './EditTaskModal.css';
import useSound from '../hooks/useSound';
import editProfileSound from '../assets/sounds/notification-1-269296.mp3';

function EditTaskModal({ show, handleClose, task, handleSave }) {
  const [updatedTask, setUpdatedTask] = useState({
    name: task.name || '',
    description: task.description || '',
    priority: task.priority || 'Low',
    difficulty: task.difficulty || 1, // Cambiado a número
    status: task.status || 'Pending',
    estimated_time: task.estimated_time || '',
    actual_time: task.actual_time || '',
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const playEditProfileSound = useSound(editProfileSound);

  useEffect(() => {
    setUpdatedTask({
      name: task.name || '',
      description: task.description || '',
      priority: task.priority || 'Low',
      difficulty: task.difficulty || 1, // Restablecido a número
      status: task.status || 'Pending',
      estimated_time: task.estimated_time || '',
      actual_time: task.actual_time || '',
    });
    setFormError('');
    setFormSuccess('');
  }, [task, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Convertir campos numéricos a números
    if (name === 'difficulty') {
      newValue = parseInt(value, 10);
    } else if (name === 'estimated_time' || name === 'actual_time') {
      newValue = value === '' ? '' : parseFloat(value);
    }

    setUpdatedTask({ ...updatedTask, [name]: newValue });
  };

  const onSave = async () => {
    setFormError('');
    setFormSuccess('');

    // Validación básica
    if (!updatedTask.name.trim()) {
      setFormError('El nombre de la tarea es obligatorio.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });

      if (response.ok) {
        const data = await response.json();
        handleSave(data);
        playEditProfileSound();
        setFormSuccess('Tarea actualizada exitosamente.');
        setTimeout(() => {
          handleClose();
        }, 1000);
      } else {
        const errorData = await response.json();
        setFormError(errorData.error || 'Error al actualizar la tarea.');
      }
    } catch (error) {
      console.error('Error al actualizar la tarea:', error);
      setFormError('Error al actualizar la tarea.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Editar Tarea</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {formError && <Alert variant="danger">{formError}</Alert>}
        {formSuccess && <Alert variant="success">{formSuccess}</Alert>}
        <Form>
          <Form.Group controlId="formTaskName">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={updatedTask.name}
              onChange={handleChange}
              placeholder="Ingrese el nombre de la tarea"
              required
            />
          </Form.Group>

          <Form.Group controlId="formTaskDescription" className="mt-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={updatedTask.description}
              onChange={handleChange}
              placeholder="Ingrese una descripción opcional"
            />
          </Form.Group>

          <Form.Group controlId="formTaskPriority" className="mt-3">
            <Form.Label>Prioridad</Form.Label>
            <Form.Control
              as="select"
              name="priority"
              value={updatedTask.priority}
              onChange={handleChange}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="formTaskDifficulty" className="mt-3">
            <Form.Label>Dificultad</Form.Label>
            <Form.Control
              as="select"
              name="difficulty"
              value={updatedTask.difficulty}
              onChange={handleChange}
            >
              <option value={1}>1 - Fácil</option>
              <option value={2}>2 - Medio</option>
              <option value={3}>3 - Difícil</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="formTaskStatus" className="mt-3">
            <Form.Label>Estado</Form.Label>
            <Form.Control
              as="select"
              name="status"
              value={updatedTask.status}
              onChange={handleChange}
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="formTaskEstimatedTime" className="mt-3">
            <Form.Label>Tiempo Estimado (horas)</Form.Label>
            <Form.Control
              type="number"
              name="estimated_time"
              value={updatedTask.estimated_time}
              onChange={handleChange}
              placeholder="Ingrese el tiempo estimado"
              min="0"
              step="0.1"
            />
          </Form.Group>

          <Form.Group controlId="formTaskActualTime" className="mt-3">
            <Form.Label>Tiempo Real (horas)</Form.Label>
            <Form.Control
              type="number"
              name="actual_time"
              value={updatedTask.actual_time}
              onChange={handleChange}
              placeholder="Ingrese el tiempo real"
              min="0"
              step="0.1"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onSave} disabled={loading}>
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />{' '}
              Guardando...
            </>
          ) : (
            'Guardar Cambios'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditTaskModal;
