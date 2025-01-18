// frontend/src/components/TaskList.js
import React, { useState, useEffect } from 'react';
import TaskItem from './TaskItem';
import './TaskList.css';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaFilter, FaTimes } from 'react-icons/fa';

function TaskList({ tasks, setTasks }) {
  const [filters, setFilters] = useState({
    priority: [],
    difficulty: [],
    status: [],
  });

  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line
  }, [tasks, filters]);

  const handleFilterChange = (category, value) => {
    setFilters((prevFilters) => {
      const newCategory = prevFilters[category].includes(value)
        ? prevFilters[category].filter((item) => item !== value)
        : [...prevFilters[category], value];
      return { ...prevFilters, [category]: newCategory };
    });
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    // Filtros de Prioridad
    if (filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority.includes(task.priority));
    }

    // Filtros de Dificultad
    if (filters.difficulty.length > 0) {
      filtered = filtered.filter(task => filters.difficulty.includes(task.difficulty.toString()));
    }

    // Filtros de Estado
    if (filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status.includes(task.status));
    }

    setFilteredTasks(filtered);
  };

  const handleClearFilters = () => {
    setFilters({
      priority: [],
      difficulty: [],
      status: [],
    });
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(filteredTasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFilteredTasks(items);

    // Opcional: Actualizar el orden en el backend si es necesario
  };

  return (
    <div className="task-list">
      {/* Botón para Mostrar/Ocultar Filtros */}
      <Button variant="outline-primary" className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
        {showFilters ? <FaTimes /> : <FaFilter />} {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
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
                    checked={filters.priority.includes('Low')}
                    onChange={() => handleFilterChange('priority', 'Low')}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Media"
                    value="Medium"
                    checked={filters.priority.includes('Medium')}
                    onChange={() => handleFilterChange('priority', 'Medium')}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Alta"
                    value="High"
                    checked={filters.priority.includes('High')}
                    onChange={() => handleFilterChange('priority', 'High')}
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
                    checked={filters.difficulty.includes('1')}
                    onChange={() => handleFilterChange('difficulty', '1')}
                  />
                  <Form.Check
                    type="checkbox"
                    label="2 - Medio"
                    value="2"
                    checked={filters.difficulty.includes('2')}
                    onChange={() => handleFilterChange('difficulty', '2')}
                  />
                  <Form.Check
                    type="checkbox"
                    label="3 - Difícil"
                    value="3"
                    checked={filters.difficulty.includes('3')}
                    onChange={() => handleFilterChange('difficulty', '3')}
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
                    checked={filters.status.includes('Pending')}
                    onChange={() => handleFilterChange('status', 'Pending')}
                  />
                  <Form.Check
                    type="checkbox"
                    label="En Progreso"
                    value="In Progress"
                    checked={filters.status.includes('In Progress')}
                    onChange={() => handleFilterChange('status', 'In Progress')}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Completado"
                    value="Completed"
                    checked={filters.status.includes('Completed')}
                    onChange={() => handleFilterChange('status', 'Completed')}
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
        <Droppable droppableId="tasks">
          {(provided) => (
            <div className="task-container" {...provided.droppableProps} ref={provided.innerRef}>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={snapshot.isDragging ? 'dragging' : ''}
                      >
                        <TaskItem
                          task={task}
                          onComplete={(id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'Completed' } : t))}
                          onDelete={(id) => setTasks(prev => prev.filter(t => t.id !== id))}
                          onEdit={(id, updatedTask) => setTasks(prev => prev.map(t => t.id === id ? updatedTask : t))}
                          onArchive={(id) => setTasks(prev => prev.filter(t => t.id !== id))}
                          onUnarchive={(id) => setTasks(prev => [...prev, { ...task, status: 'Pending' }])}
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

export default TaskList;
