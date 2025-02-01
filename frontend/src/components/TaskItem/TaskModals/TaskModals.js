import EditTaskModal from "../../EditTaskModal/EditTaskModal";
import ConfirmModal from "../../ConfirmModal/ConfirmModal";
import CollaboratorsModal from "../CollaboratorsModal/CollaboratorsModal";
import { Alert } from 'react-bootstrap';
import './TaskModals.css';

function TaskModals({
  showEditModal,
  setShowEditModal,
  showDeleteConfirm,
  setShowDeleteConfirm,
  showCollaboratorsModal,
  setShowCollaboratorsModal,
  task,
  handleEditSave,
  confirmDelete,
  actionError,
}) {
  return (
    <>
      <EditTaskModal
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        task={task}
        handleSave={handleEditSave}
      />
      <ConfirmModal
        show={showDeleteConfirm}
        handleClose={() => setShowDeleteConfirm(false)}
        handleConfirm={confirmDelete}
        title="Confirmar Eliminación"
        body="¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer."
      />
      <CollaboratorsModal
        show={showCollaboratorsModal}
        handleClose={() => setShowCollaboratorsModal(false)}
        taskId={task.id}
      />
      {actionError && <Alert variant="danger">{actionError}</Alert>}
    </>
  );
}

export default TaskModals;
