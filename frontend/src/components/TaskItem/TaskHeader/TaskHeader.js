import { Card, Dropdown } from 'react-bootstrap';
import { FaEdit, FaUsers, FaEllipsisV } from 'react-icons/fa';
import './TaskHeader.css';

function TaskHeader({ task, onShowEditModal, onShowCollaboratorsModal }) {
  return (
    <Card.Header className="task-header">
      <h2>{task.title}</h2>
      <div className="header-actions">
        <Dropdown>
          <Dropdown.Toggle variant="light" id="dropdown-basic" aria-label="Menú de acciones">
            <FaEllipsisV />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={onShowEditModal}>
              <FaEdit /> Editar
            </Dropdown.Item>
            <Dropdown.Item onClick={onShowCollaboratorsModal}>
              <FaUsers /> Colaboradores
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </Card.Header>
  );
}

export default TaskHeader;
