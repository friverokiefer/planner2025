import { Card } from 'react-bootstrap';
import './TaskDetails.css';

function TaskDetails({ task }) {
  return (
    <Card.Body className="task-details">
      <div className="detail-row">
        <span className="detail-label">Descripción:</span>
        <span className="detail-value">{task.description}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Prioridad:</span>
        <span className="detail-value">{task.priority}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Dificultad:</span>
        <span className="detail-value">{task.difficulty}</span>
      </div>
      {/* Agrega más detalles si es necesario */}
    </Card.Body>
  );
}

export default TaskDetails;
