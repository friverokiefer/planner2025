import { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Spinner, Form } from 'react-bootstrap';
import authService from '../../../services/authService';
import PropTypes from 'prop-types';
import './CollaboratorsModal.css';

function CollaboratorsModal({ show, handleClose, taskId }) {
  const [friends, setFriends] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [friendsFetched, setFriendsFetched] = useState(false);
  const currentUser = authService.getCurrentUser();

  const fetchFriendsAccepted = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/friends/list', {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const friendsList = data.map(f => {
          const isFromMe = f.user_id === currentUser.id;
          return isFromMe
            ? {
                friendUserId: f.friend_id,
                friendName: f.to_name,
                friendEmail: f.to_email,
                friendPhoto: f.to_photo,
              }
            : {
                friendUserId: f.user_id,
                friendName: f.from_name,
                friendEmail: f.from_email,
                friendPhoto: f.from_photo,
              };
        });
        setFriends(friendsList);
        setFriendsFetched(true);
      } else {
        console.error('Error al obtener amistades aceptadas');
      }
    } catch (err) {
      console.error('Error al obtener amigos (accepted):', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (show && !friendsFetched) {
      fetchFriendsAccepted();
    }
    if (!show) {
      setFriendsFetched(false);
      setFriends([]);
      setSelected(new Set());
    }
  }, [show, friendsFetched, fetchFriendsAccepted]);

  const toggleUser = (id) => {
    setSelected(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      for (const userId of selected) {
        await fetch(`/api/tasks/${taskId}/share`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser.token}`,
          },
          body: JSON.stringify({ collaborator_id: userId }),
        });
      }
      handleClose(true);
    } catch (error) {
      console.error('Error al asignar colaboradores:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={() => handleClose(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Asignar Colaboradores</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && <Spinner animation="border" />}
        {!loading && friends.length === 0 && (
          <p>No se encontraron amigos para asignar.</p>
        )}
        {!loading && friends.map(fr => (
          <Form.Check
            key={fr.friendUserId}
            type="checkbox"
            label={
              <div className="collab-item">
                <img
                  src={fr.friendPhoto?.trim() ? fr.friendPhoto : '/default_silueta.jpeg'}
                  alt="foto"
                  className="collab-photo"
                />
                <span>{fr.friendName} ({fr.friendEmail})</span>
              </div>
            }
            checked={selected.has(fr.friendUserId)}
            onChange={() => toggleUser(fr.friendUserId)}
          />
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => handleClose(false)} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

CollaboratorsModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  taskId: PropTypes.number.isRequired,
};

export default CollaboratorsModal;
