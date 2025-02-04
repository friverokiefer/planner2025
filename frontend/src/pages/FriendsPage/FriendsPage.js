// frontend/src/pages/FriendsPage/FriendsPage.js
import { useState, useEffect } from 'react';
import authService from '../../services/authService';
import useSound from '../../hooks/useSound';
import { Alert, Button, Form, Card, Row, Col } from 'react-bootstrap';
import friendRequestSound from '../../assets/sounds/intro-sound-4-270301.mp3';
import acceptSound from '../../assets/sounds/level-up-191997.mp3';
import errorSound from '../../assets/sounds/ui-sound-off-270300.mp3';
import './FriendsPage.css';

function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');

  const playRequestSound = useSound(friendRequestSound);
  const playAcceptSound = useSound(acceptSound);
  const playErrorSound = useSound(errorSound);

  const user = authService.getCurrentUser();

  // Cargar amigos
  const fetchFriends = async () => {
    try {
      const res = await fetch('/api/friends/list', {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setFriends(data);
      } else {
        playErrorSound();
        setError('Error al obtener amigos');
      }
    } catch (err) {
      playErrorSound();
      setError('Error al obtener amigos');
    }
  };

  // Cargar solicitudes
  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/friends/requests', {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      } else {
        playErrorSound();
        setError('Error al obtener solicitudes');
      }
    } catch (err) {
      playErrorSound();
      setError('Error al obtener solicitudes');
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchRequests();
    // eslint-disable-next-line
  }, []);

  // Buscar usuarios
  const handleSearch = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`/api/friends/search?query=${searchQuery}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      } else {
        playErrorSound();
        setError('Error al buscar usuarios');
      }
    } catch (err) {
      playErrorSound();
      setError('Error al buscar usuarios');
    }
  };

  // Enviar solicitud
  const handleSendRequest = async to_user_id => {
    setError('');
    try {
      const res = await fetch('/api/friends/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ to_user_id }),
      });
      if (res.ok) {
        playRequestSound();
        alert(`Solicitud de amistad enviada a user_id=${to_user_id}`);
      } else {
        const errorData = await res.json();
        playErrorSound();
        setError(errorData.error || 'Error al enviar solicitud');
      }
    } catch (err) {
      playErrorSound();
      setError('Error al enviar solicitud');
    }
  };

  // Aceptar solicitud
  const handleAccept = async requestId => {
    setError('');
    try {
      const res = await fetch(`/api/friends/${requestId}/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (res.ok) {
        setRequests(prev => prev.filter(r => r.id !== requestId));
        fetchFriends();
        playAcceptSound();
      } else {
        playErrorSound();
        setError('Error al aceptar solicitud');
      }
    } catch (err) {
      playErrorSound();
      setError('Error al aceptar solicitud');
    }
  };

  // Rechazar solicitud
  const handleReject = async requestId => {
    setError('');
    try {
      const res = await fetch(`/api/friends/${requestId}/reject`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (res.ok) {
        // Quitamos la solicitud del array local
        setRequests(prev => prev.filter(r => r.id !== requestId));
      } else {
        playErrorSound();
        setError('Error al rechazar solicitud');
      }
    } catch (err) {
      playErrorSound();
      setError('Error al rechazar solicitud');
    }
  };

  const getPhotoOrDefault = url =>
    url && url.trim() !== '' ? url : '/default_silueta.jpeg';

  return (
    <div className="friends-page-container">
      <h2>Amigos & Solicitudes</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="search-form mb-4">
        <Form onSubmit={handleSearch}>
          <Form.Group>
            <Form.Label>Buscar usuario por email o ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="user@example.com o 123"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="mt-2">
            Buscar
          </Button>
        </Form>
      </div>

      {searchResults.length > 0 && (
        <div className="search-results mb-4">
          <h4>Resultados de la búsqueda:</h4>
          <Row>
            {searchResults.map(u => (
              <Col key={u.id} xs={12} md={6} lg={4} className="mb-3">
                <Card className="p-2">
                  <Card.Body className="d-flex align-items-center">
                    <img
                      src={getPhotoOrDefault(u.profile_picture_url)}
                      alt="avatar"
                      className="friend-avatar"
                    />
                    <div className="friend-info">
                      <div>
                        <strong>ID:</strong> {u.id}
                      </div>
                      <div>
                        <strong>{u.name}</strong> <small>({u.email})</small>
                      </div>
                    </div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleSendRequest(u.id)}
                      style={{ marginLeft: 'auto' }}
                    >
                      Enviar
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      <div className="pending-requests mb-4">
        <h4>Solicitudes Recibidas</h4>
        {requests.length === 0 ? (
          <p>No tienes solicitudes pendientes.</p>
        ) : (
          <Row>
            {requests.map(req => (
              <Col key={req.id} xs={12} md={6} lg={4} className="mb-3">
                <Card className="p-2">
                  <Card.Body className="d-flex align-items-center">
                    <img
                      src={getPhotoOrDefault(req.from_photo)}
                      alt="avatar"
                      className="friend-avatar"
                    />
                    <div className="friend-info">
                      <div>
                        <strong>De:</strong> {req.from_name}{' '}
                        <small>(ID: {req.from_user_id})</small>
                      </div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleAccept(req.id)}
                        style={{ marginRight: '8px' }}
                      >
                        Aceptar
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleReject(req.id)}
                      >
                        Rechazar
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      <div className="accepted-friends">
        <h4>Mis Amigos</h4>
        {friends.length === 0 ? (
          <p>Aún no tienes amigos aceptados.</p>
        ) : (
          <Row>
            {friends.map(f => {
              const isFromMe = f.from_user_id === user?.id;
              const friendId = isFromMe ? f.to_user_id : f.from_user_id;
              const friendName = isFromMe ? f.to_name : f.from_name;
              const friendPhoto = isFromMe ? f.to_photo : f.from_photo;

              return (
                <Col key={f.id} xs={12} md={6} lg={4} className="mb-3">
                  <Card className="p-2">
                    <Card.Body className="d-flex align-items-center">
                      <img
                        src={getPhotoOrDefault(friendPhoto)}
                        alt="avatar"
                        className="friend-avatar"
                      />
                      <div className="friend-info">
                        <div>
                          <strong>ID:</strong> {friendId}
                        </div>
                        <div>
                          <strong>{friendName}</strong> (status: {f.status})
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>
    </div>
  );
}

export default FriendsPage;
