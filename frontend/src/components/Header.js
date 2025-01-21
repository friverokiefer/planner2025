// frontend/src/components/Header.js
import React, { useState } from 'react';
import authService from '../services/authService';
import { Navbar, Nav, Form } from 'react-bootstrap'; // Ejemplo usando react-bootstrap

const colorThemes = [
  { label: 'Claro', background: '#f8f9fa', text: '#000' },
  { label: 'Oscuro', background: '#343a40', text: '#fff' },
  { label: 'Azul', background: '#007bff', text: '#fff' },
  { label: 'Verde', background: '#28a745', text: '#fff' },
];

function Header() {
  const user = authService.getCurrentUser();

  // Estado para tema
  const [theme, setTheme] = useState(colorThemes[0]); // por defecto 'Claro'

  const handleThemeChange = (e) => {
    const index = e.target.value;
    setTheme(colorThemes[index]);
  };

  const headerStyle = {
    backgroundColor: theme.background,
    color: theme.text,
    transition: 'background-color 0.3s, color 0.3s',
  };

  return (
    <Navbar style={headerStyle} expand="lg">
      <Navbar.Brand style={{ color: theme.text }}>Mi App</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" style={{ backgroundColor: theme.text }} />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          {user ? (
            <Nav.Item style={{ color: theme.text, marginRight: '1rem' }}>
              Bienvenido, {user.name}
            </Nav.Item>
          ) : (
            <Nav.Item style={{ color: theme.text, marginRight: '1rem' }}>
              No logueado
            </Nav.Item>
          )}
        </Nav>
        <Form inline>
          <Form.Control
            as="select"
            onChange={handleThemeChange}
            style={{ marginRight: '10px' }}
          >
            {colorThemes.map((ct, idx) => (
              <option value={idx} key={idx}>
                {ct.label}
              </option>
            ))}
          </Form.Control>
        </Form>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Header;
