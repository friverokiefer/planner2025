import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import './EditTaskModal.css';
import useSound from '../../hooks/useSound';
import editTaskSound from '../../assets/sounds/notification-1-269296.mp3';
import authService from '../../services/authService';

function EditTaskModal({ show, handleClose, task, handleSave }) {
  const [updatedTask, setUpdatedTask] = useState({
    title: '',
    description: '',
    priority: 'Low',
    difficulty: 1,
    status: 'Pending',
    estimated_time: '',
    actual_time: '',
    start_date: '',
    end_date: '',
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [enableEndDate, setEnableEndDate] = useState(false);

  const playEditTaskSound = useSound(editTaskSound);

  useEffect(() => {
    if (task && show) {
      setUpdatedTask({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'Low',
        difficulty: task.difficulty || 1,
        status: task.status || 'Pending',
        estimated_time: task.estimated_time || '',
        actual_time: task.actual_time || '',
        start_date: task.start_date
          ? task.start_date.split('T')[0] || task.start_date
          : '',
        end_date: task.end_date
          ? task.end_date.split('T')[0] || task.end_date
          : '',
      });
      setEnableEndDate(!!task.end_date);
      setFormError('');
      setFormSuccess('');
    }
  }, [task, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Convertir campos numéricos a número
    if (name === 'difficulty') {
      newValue = parseInt(value, 10);
    } else if (name === 'estimated_time' || name === 'actual_time') {
      newValue = value === '' ? '' : parseFloat(value);
    }
    setUpdatedTask((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleToggleEndDate = () => {
    setEnableEndDate((prev) => !prev);
    if (enableEndDate) {
      setUpdatedTask((prev) => ({ ...prev, end_date: '' }));
    }
  };

  const onSave = async () => {
    setFormError('');
    setFormSuccess('');

    if (!updatedTask.title.trim()) {
      setFormError('El título de la tarea es obligatorio.');
      return;
    }

    // Validación de fechas
    if (updatedTask.start_date && updatedTask.end_date) {
      if (new Date(updatedTask.end_date) < new Date(updatedTask.start_date)) {
        setFormError(
          'La fecha de término no puede ser anterior a la fecha de inicio.'
        );
        return;
      }
    }

    setLoading(true);

    try {
      const user = authService.getCurrentUser();
      if (!user || !user.token) {
        setFormError('No hay usuario autenticado.');
        setLoading(false);
        return;
      }

      // Enviar PUT con updatedTask
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setFormError(errorData.error || 'Error al actualizar la tarea');
      } else {
        const data = await response.json();
        // Notificar al padre
        handleSave(data);
        playEditTaskSound();
        setFormSuccess('Tarea actualizada exitosamente.');
        // Cerrar tras un breve delay
        setTimeout(() => {
          handleClose();
          setFormSuccess('');
        }, 1500);
      }
    } catch (error) {
      console.error('Error al actualizar la tarea:', error);
      setFormError('Error al actualizar la tarea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={() => {
        handleClose();
        setFormError('');
        setFormSuccess('');
      }}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Tarea</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {formError && <Alert variant="danger">{formError}</Alert>}
        {formSuccess && <Alert variant="success">{formSuccess}</Alert>}

        <Form>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formTaskTitle">
                <Form.Label>Título</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={updatedTask.title}
                  onChange={handleChange}
                  placeholder="Título de la tarea"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formTaskPriority">
                <Form.Label>Prioridad</Form.Label>
                <Form.Control
                  as="select"
                  name="priority"
                  value={updatedTask.priority}
                  onChange={handleChange}
                >
                  {/* Los values siguen en inglés, para no romper la BD */}
                  <option value="Low">Baja</option>
                  <option value="Medium">Media</option>
                  <option value="High">Alta</option>
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col md={6}>
              <Form.Group controlId="formTaskDifficulty">
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
            </Col>
            <Col md={6}>
              <Form.Group controlId="formTaskStatus">
                <Form.Label>Estado</Form.Label>
                <Form.Control
                  as="select"
                  name="status"
                  value={updatedTask.status}
                  onChange={handleChange}
                >
                  <option value="Pending">Pendiente</option>
                  <option value="In Progress">En Progreso</option>
                  <option value="Completed">Completado</option>
                  <option value="Archived">Archivada</option>
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col md={6}>
              <Form.Group controlId="formTaskEstimatedTime">
                <Form.Label>Tiempo Estimado (horas)</Form.Label>
                <Form.Control
                  type="number"
                  name="estimated_time"
                  value={updatedTask.estimated_time}
                  onChange={handleChange}
                  placeholder="Tiempo estimado"
                  min="0"
                  step="0.1"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formTaskActualTime">
                <Form.Label>Tiempo Real (horas)</Form.Label>
                <Form.Control
                  type="number"
                  name="actual_time"
                  value={updatedTask.actual_time}
                  onChange={handleChange}
                  placeholder="Tiempo real"
                  min="0"
                  step="0.1"
                  readOnly
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-3 align-items-center">
            <Col md={6}>
              <Form.Group controlId="formTaskStartDate">
                <Form.Label>Fecha de Inicio</Form.Label>
                <Form.Control
                  type="date"
                  name="start_date"
                  value={updatedTask.start_date}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formTaskEndDate">
                <Form.Label>Fecha de Término</Form.Label>
                <Form.Check
                  type="switch"
                  id="enable-end-date-switch"
                  label="Activar Fecha de Término"
                  checked={enableEndDate}
                  onChange={handleToggleEndDate}
                />
                <Form.Control
                  type="date"
                  name="end_date"
                  value={updatedTask.end_date}
                  onChange={handleChange}
                  disabled={!enableEndDate}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="formTaskDescription" className="mt-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={updatedTask.description}
              onChange={handleChange}
              placeholder="Descripción opcional"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            handleClose();
            setFormError('');
            setFormSuccess('');
          }}
          disabled={loading}
        >
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
