import React, { useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';
import './StopTimerModal.css';

function StopTimerModal({ show, onClose, onConfirm, timeSpent }) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await onConfirm(comment);
    setLoading(false);
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Detener Temporizador</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Has trabajado aproximadamente <b>{timeSpent.toFixed(4)}</b> horas.
        </p>
        <Form.Group>
          <Form.Label>Comentario (opcional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Describe brevemente lo que realizaste..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{' '}
              Guardando...
            </>
          ) : (
            'Detener y Guardar'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

StopTimerModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  timeSpent: PropTypes.number.isRequired,
};

export default StopTimerModal;
