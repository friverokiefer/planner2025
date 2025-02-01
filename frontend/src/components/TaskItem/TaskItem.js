import { useState } from "react";
import TaskHeader from "./TaskHeader/TaskHeader";
import TaskDetails from "./TaskDetails/TaskDetails";
import TaskAction from "./TaskAction/TaskAction";
import TaskModals from "./TaskModals/TaskModals";
import Timer from "./Timer/Timer";
import TaskTimeProgress from "./TaskTimeProgress/TaskTimeProgress";
import TaskStatus from "./TaskStatus/TaskStatus";
import "./TaskItem.css";

function TaskItem({ task, view = "normal", onComplete, onDelete, onEdit, onArchive, onUnarchive }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false);
  const [actionError, setActionError] = useState("");
  const [timerActive, setTimerActive] = useState(false);

  const handleEditSave = async (updatedTaskData) => {
    if (!updatedTaskData) {
      setActionError("No se proporcionaron datos actualizados.");
      return;
    }
    try {
      await onEdit(updatedTaskData);
      setShowEditModal(false);
    } catch (error) {
      setActionError("Error al guardar los cambios.");
    }
  };

  const confirmDelete = async () => {
    try {
      await onDelete(task.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      setActionError("Error al eliminar la tarea.");
    }
  };

  const handleStartTimer = () => {
    setTimerActive(true);
  };

  const handleTimeAdded = (updatedTask) => {
    onEdit(updatedTask);
    setTimerActive(false);
  };

  return (
    <div className={`task-item ${view} ${task.state === "Completed" ? "completed" : ""} ${task.state === "Archived" ? "archived" : ""}`}>
      <TaskStatus status={task.state} />
      <TaskHeader
        task={task}
        onShowEditModal={() => setShowEditModal(true)}
        onShowCollaboratorsModal={() => setShowCollaboratorsModal(true)}
      />
      <TaskDetails task={task} />
      <TaskAction
        task={task}
        onComplete={onComplete}
        onArchive={onArchive}
        onUnarchive={onUnarchive}
        onStartTimer={handleStartTimer}
        timerActive={timerActive}
        onQuickUpdate={(updatedFields) => onEdit({ ...task, ...updatedFields })}
      />
      <TaskModals
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        showCollaboratorsModal={showCollaboratorsModal}
        setShowCollaboratorsModal={setShowCollaboratorsModal}
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        handleEditSave={handleEditSave}
        confirmDelete={confirmDelete}
        actionError={actionError}
        setActionError={setActionError}
      />
      {timerActive && <Timer taskId={task.id} onTimeAdded={handleTimeAdded} />}
      <TaskTimeProgress 
         estimated={parseFloat(task.estimated_time) || 0} 
         worked={parseFloat(task.total_time_spent_hours) || 0} 
      />
      {actionError && <div className="error">{actionError}</div>}
    </div>
  );
}

export default TaskItem;
