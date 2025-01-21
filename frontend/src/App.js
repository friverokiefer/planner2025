// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
} from 'react-router-dom';

import TaskPage from './pages/TaskPage';
import ProfilePage from './pages/ProfilePage';
import ArchivedTasksPage from './pages/ArchivedTasksPage';
import TaskMetricsPage from './pages/TaskMetricsPage';
import FriendsPage from './pages/FriendsPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import './App.css';

import {
  FaTasks,
  FaUser,
  FaArchive,
  FaChartPie,
  FaHome,
  FaSignInAlt,
  FaUserPlus,
  FaUserShield,
} from 'react-icons/fa';

import authService from './services/authService';

function App() {
  const [user, setUser] = useState(undefined); // null o {token, id, role}
  const [theme, setTheme] = useState('default');
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [profileName, setProfileName] = useState(''); // <-- Estado para nombre a mostrar en H1

  // Cargar user y sus datos (nombre, foto)
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      setUser(null);
    } else {
      setUser(currentUser);
      fetchProfileData(currentUser.token);
    }
    // eslint-disable-next-line
  }, []);

  // Llamada a /api/profile para obtener name, pic...
  const fetchProfileData = async (token) => {
    try {
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // data = { name, bio, profile_picture_url, ... }
        setProfileName(data.name || ''); // Si no hay name, ''
        if (data.profile_picture_url) {
          setProfilePicUrl(data.profile_picture_url);
        } else {
          setProfilePicUrl(null);
        }
      }
    } catch (err) {
      console.error('Error fetchProfileData:', err);
      setProfilePicUrl(null);
      setProfileName('');
    }
  };

  // Manejo de login
  const handleLogin = (userData) => {
    setUser(userData);
    fetchProfileData(userData.token);
  };

  // Manejo de logout
  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setProfilePicUrl(null);
    setProfileName('');
  };

  if (user === undefined) {
    // Mientras determinamos si hay user
    return <div>Cargando sesión...</div>;
  }

  return (
    <div className={`app-container theme-${theme}`}>
      <Router>
        <header className="header">
          {/* Muestra el nombre en lugar del ID */}
          <h1>Planner2025
            {user ? ` — ¡Bienvenido, ${profileName || 'Usuario'}!` : ''}
          </h1>

          {/* Foto de perfil en el header (si existe) */}
          {profilePicUrl && (
            <img
              src={profilePicUrl}
              alt="Mi Perfil"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                marginRight: '10px',
              }}
            />
          )}

          {/* Selector de tema */}
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="default">Tema Default</option>
            <option value="dark">Tema Oscuro</option>
            <option value="pink">Tema Rosa</option>
          </select>

          <nav>
            <ul>
              <li>
                <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  <FaHome color="#fff" /> Home
                </NavLink>
              </li>

              {user ? (
                <>
                  <li>
                    <NavLink
                      to="/profile"
                      className={({ isActive }) => (isActive ? 'active' : undefined)}
                    >
                      <FaUser color="#fff" /> Profile
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/tasks"
                      className={({ isActive }) => (isActive ? 'active' : undefined)}
                    >
                      <FaTasks color="#fff" /> Tasks
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/archived"
                      className={({ isActive }) => (isActive ? 'active' : undefined)}
                    >
                      <FaArchive color="#fff" /> Archived
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/metrics"
                      className={({ isActive }) => (isActive ? 'active' : undefined)}
                    >
                      <FaChartPie color="#fff" /> Metrics
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/friends"
                      className={({ isActive }) => (isActive ? 'active' : undefined)}
                    >
                      Amigos
                    </NavLink>
                  </li>
                  {user.role === 'admin' && (
                    <li>
                      <NavLink
                        to="/admin"
                        className={({ isActive }) => (isActive ? 'active' : undefined)}
                      >
                        <FaUserShield color="#fff" /> Admin
                      </NavLink>
                    </li>
                  )}
                  <li>
                    <button onClick={handleLogout} className="logout-button">
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <NavLink
                      to="/login"
                      className={({ isActive }) => (isActive ? 'active' : undefined)}
                    >
                      <FaSignInAlt color="#fff" /> Login
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/register"
                      className={({ isActive }) => (isActive ? 'active' : undefined)}
                    >
                      <FaUserPlus color="#fff" /> Register
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </header>

        <div className="main-container">
          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route
              path="/tasks"
              element={user ? <TaskPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/profile"
              element={user ? <ProfilePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/archived"
              element={user ? <ArchivedTasksPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/metrics"
              element={user ? <TaskMetricsPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/friends"
              element={user ? <FriendsPage /> : <Navigate to="/login" />}
            />

            {/* Auth */}
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage onLogin={handleLogin} />} />

            {/* Admin */}
            <Route
              path="/admin"
              element={user?.role === 'admin' ? <AdminPage /> : <Navigate to="/login" />}
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

        <footer className="footer">© 2025 Planner2025. Built with 💜</footer>
      </Router>
    </div>
  );
}

export default App;
