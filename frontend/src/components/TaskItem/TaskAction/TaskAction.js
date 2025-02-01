import { Form, Button } from 'react-bootstrap';
import { FaCheck, FaArchive, FaPlay } from 'react-icons/fa';
import './TaskAction.css';

function TaskAction({ task, onComplete, onArchive, onUnarchive, onStartTimer, timerActive, onQuickUpdate }) {
  const handleChange = (field, value) => {
    if (onQuickUpdate) {
      onQuickUpdate({ [field]: value });
    }
  };

  return (
    <div className="task-actions">
      <div className="quick-update-row">
        <Form.Group controlId={`state-${task.id}`} className="quick-update-group">
          <Form.Label>Estado:</Form.Label>
          <Form.Control
            as="select"
            value={task.state}
            onChange={(e) => handleChange("state", e.target.value)}
          >
            <option value="Pending">Pendiente</option>
            <option value="In Progress">En Progreso</option>
            <option value="Completed">Completado</option>
            <option value="Archived">Archivada</option>
          </Form.Control>
        </Form.Group>
        <Form.Group controlId={`difficulty-${task.id}`} className="quick-update-group">
          <Form.Label>Dificultad:</Form.Label>
          <Form.Control
            as="select"
            value={task.difficulty}
            onChange={(e) => handleChange("difficulty", e.target.value)}
          >
            <option value="1">Fácil</option>
            <option value="2">Medio</option>
            <option value="3">Difícil</option>
          </Form.Control>
        </Form.Group>
        <Form.Group controlId={`priority-${task.id}`} className="quick-update-group">
          <Form.Label>Prioridad:</Form.Label>
          <Form.Control
            as="select"
            value={task.priority}
            onChange={(e) => handleChange("priority", e.target.value)}
          >
            <option value="Low">Baja</option>
            <option value="Medium">Media</option>
            <option value="High">Alta</option>
          </Form.Control>
        </Form.Group>
      </div>
      <div className="action-buttons">
        {task.state !== "Completed" && (
          <Button variant="success" size="sm" onClick={() => onComplete(task.id)}>
            <FaCheck /> Completar
          </Button>
        )}
        {task.state !== "Archived" ? (
          <Button variant="warning" size="sm" onClick={() => onArchive(task.id)}>
            <FaArchive /> Archivar
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => onUnarchive(task.id)}>
            <FaArchive /> Desarchivar
          </Button>
        )}
        {!timerActive && (
          <Button variant="primary" size="sm" onClick={onStartTimer}>
            <FaPlay /> Iniciar Timer
          </Button>
        )}
      </div>
    </div>
  );
}

export default TaskAction;
