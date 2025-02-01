// frontend/src/components/AddCommentModal/AddCommentModal.jsx
import React, { useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import authService from '../../services/authService';

function AddCommentModal({ show, handleClose, taskId, onCommentAdded }) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const user = authService.getCurrentUser();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ comment }),
      });
      if (!res.ok) {
        throw new Error('No se pudo añadir el comentario');
      }
      const newComment = await res.json();
      onCommentAdded && onCommentAdded(newComment);
      handleClose();
    } catch (error) {
      console.error('Error añadiendo comentario:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Añadir Comentario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Comentario</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Escribe tu comentario aquí..."
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />{' '}
              Guardando...
            </>
          ) : (
            'Añadir'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddCommentModal;
