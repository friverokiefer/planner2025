import { useState } from 'react';
import TaskItem from '../../TaskItem/TaskItem';
import './TaskListView.css';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaFilter, FaTimes } from 'react-icons/fa';
import PropTypes from 'prop-types';
import useSound from '../../../hooks/useSound';
import dragSoundFile from '../../../assets/sounds/navigation-sound-2-269295.mp3';

function TaskListView({ tasks, setTasks }) {
  const [filters, setFilters] = useState({
    priority: [],
    difficulty: [],
    status: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const playDragSound = useSound(dragSoundFile);

  const getFilteredTasks = () => {
    let filtered = [...tasks];
    if (filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority.includes(task.priority));
    }
    if (filters.difficulty.length > 0) {
      filtered = filtered.filter(task => filters.difficulty.includes(String(task.difficulty)));
    }
    if (filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status.includes(task.state));
    }
    return filtered;
  };

  const handleFilterChange = (category, value) => {
    setFilters(prev => {
      const alreadySelected = prev[category].includes(value);
      const newArray = alreadySelected ? prev[category].filter(item => item !== value) : [...prev[category], value];
      return { ...prev, [category]: newArray };
    });
  };

  const handleClearFilters = () => {
    setFilters({ priority: [], difficulty: [], status: [] });
  };

  const handleOnDragEnd = result => {
    if (!result.destination) return;
    playDragSound();
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTasks(items);
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="task-list-view">
      <Button variant="outline-primary" className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
        {showFilters ? <FaTimes /> : <FaFilter />} {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
      </Button>

      {showFilters && (
        <div className="filters">
          <Form>
            <Row>
              <Col md={4} sm={12}>
                <Form.Group>
                  <Form.Label><FaFilter /> Prioridad</Form.Label>
                  <Form.Check
                    type="checkbox"
                    label="Baja"
                    value="Low"
                    checked={filters.priority.includes("Low")}
                    onChange={() => handleFilterChange("priority", "Low")}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Media"
                    value="Medium"
                    checked={filters.priority.includes("Medium")}
                    onChange={() => handleFilterChange("priority", "Medium")}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Alta"
                    value="High"
                    checked={filters.priority.includes("High")}
                    onChange={() => handleFilterChange("priority", "High")}
                  />
                </Form.Group>
              </Col>
              <Col md={4} sm={12}>
                <Form.Group>
                  <Form.Label><FaFilter /> Dificultad</Form.Label>
                  <Form.Check
                    type="checkbox"
                    label="1 - Fácil"
                    value="1"
                    checked={filters.difficulty.includes("1")}
                    onChange={() => handleFilterChange("difficulty", "1")}
                  />
                  <Form.Check
                    type="checkbox"
                    label="2 - Medio"
                    value="2"
                    checked={filters.difficulty.includes("2")}
                    onChange={() => handleFilterChange("difficulty", "2")}
                  />
                  <Form.Check
                    type="checkbox"
                    label="3 - Difícil"
                    value="3"
                    checked={filters.difficulty.includes("3")}
                    onChange={() => handleFilterChange("difficulty", "3")}
                  />
                </Form.Group>
              </Col>
              <Col md={4} sm={12}>
                <Form.Group>
                  <Form.Label><FaFilter /> Estado</Form.Label>
                  <Form.Check
                    type="checkbox"
                    label="Pendiente"
                    value="Pending"
                    checked={filters.status.includes("Pending")}
                    onChange={() => handleFilterChange("status", "Pending")}
                  />
                  <Form.Check
                    type="checkbox"
                    label="En Progreso"
                    value="In Progress"
                    checked={filters.status.includes("In Progress")}
                    onChange={() => handleFilterChange("status", "In Progress")}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Completado"
                    value="Completed"
                    checked={filters.status.includes("Completed")}
                    onChange={() => handleFilterChange("status", "Completed")}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button variant="secondary" onClick={handleClearFilters} className="mt-3">
              Limpiar Filtros
            </Button>
          </Form>
        </div>
      )}

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="task-droppable">
          {provided => (
            <div className="task-container normal" {...provided.droppableProps} ref={provided.innerRef}>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={snapshot.isDragging ? "dragging" : ""}
                      >
                        <TaskItem
                          task={task}
                          view="normal"
                          onComplete={updatedTask =>
                            setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t))
                          }
                          onDelete={id =>
                            setTasks(prev => prev.filter(t => t.id !== id))
                          }
                          onEdit={updatedTask =>
                            setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t))
                          }
                          onArchive={updatedTask =>
                            setTasks(prev => prev.filter(t => t.id !== updatedTask.id))
                          }
                          onUnarchive={updatedTask =>
                            setTasks(prev => [...prev, updatedTask])
                          }
                        />
                      </div>
                    )}
                  </Draggable>
                ))
              ) : (
                <p>No hay tareas que coincidan con los filtros seleccionados.</p>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

TaskListView.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
  setTasks: PropTypes.func.isRequired,
};

export default TaskListView;
