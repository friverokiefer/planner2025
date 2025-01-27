// frontend/src/components/Header/Header.js

import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import useSound from '../../hooks/useSound';
import menuClickSoundFile from '../../assets/sounds/notification-pluck-on-269288.mp3'; // el que pediste
import { Dropdown } from 'react-bootstrap';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [profileName, setProfileName] = useState('');
  const [theme, setTheme] = useState('default');

  const playMenuClick = useSound(menuClickSoundFile);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      setUser(null);
    } else {
      setUser(currentUser);
      fetchProfileData(currentUser.token);
    }
  }, []);

  const fetchProfileData = async (token) => {
    try {
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfileName(data.name || '');
        setProfilePicUrl(data.profile_picture_url || '');
      }
    } catch (err) {
      console.error('Error fetchProfileData:', err);
      setProfilePicUrl('');
      setProfileName('');
    }
  };

  const handleLogout = () => {
    playMenuClick();
    authService.logout();
    setUser(null);
    setProfilePicUrl('');
    setProfileName('');
    navigate('/login');
  };

  const handleEditProfile = () => {
    playMenuClick();
    navigate('/profile');
  };

  return (
    <header className="main-header">
      <div className="header-left">
        <h1>Planner2025 — ¡Bienvenido, {profileName || 'Usuario'}!</h1>
      </div>

      <div className="header-right">
        <div className="theme-selector">
          <label htmlFor="theme-select">Tema:</label>
          <select
            id="theme-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="default">Default</option>
            <option value="dark">Oscuro</option>
            <option value="pink">Rosa</option>
          </select>
        </div>

        <nav className="nav-links">
          <NavLink to="/" onClick={playMenuClick}>
            Home
          </NavLink>
          {user ? (
            <>
              <NavLink to="/tasks" onClick={playMenuClick}>
                Tareas
              </NavLink>
              <NavLink to="/archived-tasks" onClick={playMenuClick}>
                Archivadas
              </NavLink>
              <NavLink to="/task-metrics" onClick={playMenuClick}>
                Métricas
              </NavLink>
              <NavLink to="/friends" onClick={playMenuClick}>
                Amigos
              </NavLink>
              {user.role === 'admin' && (
                <NavLink to="/admin" onClick={playMenuClick}>
                  Admin
                </NavLink>
              )}
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={playMenuClick}>
                Iniciar Sesión
              </NavLink>
              <NavLink to="/register" onClick={playMenuClick}>
                Registrarse
              </NavLink>
            </>
          )}
        </nav>

        {/* Imagen de perfil + dropdown */}
        {user && (
          <Dropdown className="profile-dropdown">
            <Dropdown.Toggle variant="link" id="profile-dropdown-toggle">
              <img
                src={
                  profilePicUrl?.trim()
                    ? profilePicUrl
                    : '/default_silueta.jpeg'
                }
                alt="Mi Perfil"
                className="profile-picture-header"
                onClick={playMenuClick}
              />
            </Dropdown.Toggle>
            <Dropdown.Menu align="end">
              <Dropdown.Item onClick={handleEditProfile}>
                Editar Perfil
              </Dropdown.Item>
              <Dropdown.Item onClick={handleLogout}>
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
      </div>
    </header>
  );
}

export default Header;
