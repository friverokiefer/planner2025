// frontend/src/pages/AdminPage/AdminPage.js

import { useEffect, useState } from 'react';
import authService from '../../services/authService';
import { Table, Alert, Button, Modal, Form } from 'react-bootstrap';
import './AdminPage.css';

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  // Para editar
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState({ id: '', name: '' });

  // Para crear
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const fetchUsers = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.token) {
        setError('No hay usuario logueado o no tienes permisos.');
        return;
      }
      const response = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      setError('Error al obtener usuarios');
    }
  };

  // Abrir modal de edición
  const handleOpenEdit = user => {
    setEditUser({ id: user.id, name: user.name });
    setShowEditModal(true);
  };

  const handleEditChange = e => {
    setEditUser({ ...editUser, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async () => {
    try {
      setError(null);
      const currentUser = authService.getCurrentUser();
      const response = await fetch(`/api/users/${editUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({ name: editUser.name }),
      });
      if (!response.ok) {
        throw new Error('Error al actualizar usuario');
      }
      await response.json();
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError('No se pudo actualizar el usuario.');
    }
  };

  // Eliminar usuario
  const handleDelete = async id => {
    try {
      setError(null);
      const currentUser = authService.getCurrentUser();
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Error al eliminar usuario');
      }
      await response.json();
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError('No se pudo eliminar el usuario.');
    }
  };

  // Crear usuario
  const handleCreateUser = async () => {
    try {
      setError(null);
      // Podrías usar /api/auth/register (y forzar role='admin'),
      // o tener un endpoint /api/users con POST
      const currentUser = authService.getCurrentUser();
      // EJEMPLO: USANDO /api/auth/register con role
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`, // si exiges token
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          // role: newUser.role, // si tu backend lo permite
        }),
      });
      if (!response.ok) {
        throw new Error('Error al crear usuario');
      }
      await response.json();
      setShowCreateModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError('No se pudo crear el usuario.');
    }
  };

  return (
    <div className="admin-container">
      <h1>Panel de Administración</h1>
      {error && <Alert variant="danger">{error}</Alert>}

      <Button
        variant="success"
        className="mb-3"
        onClick={() => setShowCreateModal(true)}
      >
        Crear Usuario
      </Button>

      {users.length > 0 ? (
        <Table striped bordered hover responsive className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleOpenEdit(u)}
                  >
                    Editar
                  </Button>{' '}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(u.id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No hay usuarios disponibles.</p>
      )}

      {/* Modal para editar usuario */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={editUser.name}
              onChange={handleEditChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveEdit}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para crear usuario */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Crear Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              value={newUser.name}
              onChange={e => setNewUser({ ...newUser, name: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              value={newUser.password}
              onChange={e =>
                setNewUser({ ...newUser, password: e.target.value })
              }
            />
          </Form.Group>
          {/* Si deseas elegir rol: */}
          {/* <Form.Group className="mt-3">
            <Form.Label>Rol</Form.Label>
            <Form.Select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </Form.Select>
          </Form.Group> */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleCreateUser}>
            Crear
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminPage;
