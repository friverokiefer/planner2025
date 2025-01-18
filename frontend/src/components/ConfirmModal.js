// frontend/src/components/ConfirmModal.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
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

export default ConfirmModal;
