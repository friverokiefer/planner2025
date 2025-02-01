// frontend/src/components/ConfirmModal/ConfirmModal.js

import { Modal, Button } from 'react-bootstrap';
import PropTypes from 'prop-types'; // Importamos PropTypes
import './ConfirmModal.css';

function ConfirmModal({ show, handleClose, handleConfirm, title, body }) {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title || 'Confirmación'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{body || '¿Estás seguro?'}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleConfirm}>
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// Definimos los propTypes
ConfirmModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  body: PropTypes.string,
};

export default ConfirmModal;
