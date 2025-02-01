import React from 'react';
import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TaskItem from '../../TaskItem/TaskItem';
import './TaskWideView.css';

const TaskWideView = ({ tasks, onComplete, onDelete, onEdit, onArchive, onUnarchive, setTasks }) => {
  const onDragEnd = result => {
    if (!result.destination) return;
    const newTasks = Array.from(tasks);
    const [removed] = newTasks.splice(result.source.index, 1);
    newTasks.splice(result.destination.index, 0, removed);
    setTasks(newTasks);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="wide-tasks">
        {provided => (
          <div className="task-wide-view" ref={provided.innerRef} {...provided.droppableProps}>
            {tasks.map((task, index) => (
              <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                {(provided, snapshot) => (
                  <div 
                    className={`task-wide-card ${snapshot.isDragging ? 'dragging' : ''}`}
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
    </DragDropContext>
  );
};

TaskWideView.propTypes = {
  tasks: PropTypes.array.isRequired,
  onComplete: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onArchive: PropTypes.func.isRequired,
  onUnarchive: PropTypes.func.isRequired,
  setTasks: PropTypes.func.isRequired,
};

export default TaskWideView;
