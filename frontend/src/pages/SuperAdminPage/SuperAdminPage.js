// frontend/src/pages/SuperAdminPage/SuperAdminPage.js
import React, { useState, useEffect } from 'react';
import { Table, Alert } from 'react-bootstrap';
import authService from '../../services/authService';

function SuperAdminPage() {
  const [usersExtended, setUsersExtended] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExtended();
  }, []);

  const fetchExtended = async () => {
    try {
      const user = authService.getCurrentUser();
      const res = await fetch('/api/superadmin/users-extended', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsersExtended(data);
      } else {
        throw new Error('Error al obtener info');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Panel SuperAdmin</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Amigos</th>
            <th>Tareas Pendientes</th>
            <th>Tareas En Progreso</th>
            <th>Tareas Completadas</th>
          </tr>
        </thead>
        <tbody>
          {usersExtended.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.friends_count}</td>
              <td>{u.tasks_pending}</td>
              <td>{u.tasks_inprogress}</td>
              <td>{u.tasks_completed}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default SuperAdminPage;
