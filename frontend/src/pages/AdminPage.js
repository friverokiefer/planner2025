// frontend/src/pages/AdminPage.js
import React, { useEffect, useState } from 'react';
import authService from '../services/authService';
import { Table, Alert } from 'react-bootstrap';
import './AdminPage.css';

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (!currentUser || !currentUser.token) {
          setError('No hay usuario logueado o no tienes permisos.');
          return;
        }
        // Llamar a /api/users (sólo admin)
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
    fetchUsers();
  }, []);

  return (
    <div className="admin-container">
      <h1>Panel de Administración</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {!error && users.length > 0 && (
        <Table striped bordered hover responsive className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

export default AdminPage;
