// frontend/src/components/TaskViews/TaskKanbanView/TaskKanbanView.jsx
import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TaskItem from '../../TaskItem/TaskItem';
import KanbanSwitchController from './KanbanSwitchController/KanbanSwitchController';
import './TaskKanbanView.css';

const TaskKanbanView = ({ tasks, onEdit, onComplete, onDelete, onArchive, onUnarchive, setTasks }) => {
  const [grouping, setGrouping] = useState('state');

  // Para la vista Kanban, queremos 3 columnas fijas según el criterio:
  const columnNames = useMemo(() => {
    if (grouping === 'state') return ['Pending', 'In Progress', 'Completed'];
    if (grouping === 'priority') return ['Low', 'Medium', 'High'];
    if (grouping === 'difficulty') return ['1', '2', '3'];
    return ['Columna 1', 'Columna 2', 'Columna 3'];
  }, [grouping]);

  // Agrupar tareas según la propiedad (o asignarlas a "Sin Datos" si no coinciden)
  const groupedTasks = useMemo(() => {
    const groups = {};
    columnNames.forEach(col => { groups[col] = []; });
    tasks.forEach(task => {
      const key = task[grouping] ? task[grouping].toString() : 'Sin Datos';
      // Si la tarea no coincide con ninguna de las columnas fijas, la asignamos a la primera.
      if (groups[key] === undefined) groups[columnNames[0]].push(task);
      else groups[key].push(task);
    });
    return groups;
  }, [tasks, grouping, columnNames]);

  const onDragEnd = result => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId !== destination.droppableId) {
      const taskId = parseInt(draggableId, 10);
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const updatedTask = { ...task, [grouping]: destination.droppableId };
        onEdit(updatedTask);
      }
    }
  };

  return (
    <div className="task-kanban-view">
      <KanbanSwitchController grouping={grouping} setGrouping={setGrouping} />
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-columns">
          {columnNames.map(col => (
            <Droppable droppableId={col} key={col}>
              {(provided, snapshot) => (
                <div
                  className={`kanban-column ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h3>{col}</h3>
                  {groupedTasks[col].map((task, index) => (
                    <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <div
                          className={`kanban-task ${snapshot.isDragging ? 'dragging' : ''}`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <TaskItem
                            task={task}
                            onComplete={onComplete}
                            onDelete={onDelete}
                            onEdit={onEdit}
                            onArchive={onArchive}
                            onUnarchive={onUnarchive}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

TaskKanbanView.propTypes = {
  tasks: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onArchive: PropTypes.func.isRequired,
  onUnarchive: PropTypes.func.isRequired,
  setTasks: PropTypes.func.isRequired,
};

export default TaskKanbanView;
