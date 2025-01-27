// frontend/src/App.js

import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
} from 'react-router-dom';

import TaskPage from './pages/TaskPage/TaskPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import ArchivedTasksPage from './pages/ArchivedTasksPage/ArchivedTasksPage';
import TaskMetricsPage from './pages/TaskMetricsPage/TaskMetricsPage';
import FriendsPage from './pages/FriendsPage/FriendsPage';
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import AdminPage from './pages/AdminPage/AdminPage';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'; // Componente global para errores
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

import useSound from './hooks/useSound'; // Hook personalizado
import clickSoundFile from './assets/sounds/notification-pluck-on-269288.mp3';

function App() {
  const [user, setUser] = useState(undefined); // null o {token, id, role}
  const [theme, setTheme] = useState('default');
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [profileName, setProfileName] = useState('');

  // Sonido al hacer clic en el menú
  const playClickSound = useSound(clickSoundFile);

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
        setProfileName(data.name || '');
        setProfilePicUrl(data.profile_picture_url || null);
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
    return <div className="loading-screen">Cargando sesión...</div>;
  }

  return (
    <div className={`app-container theme-${theme}`}>
      <Router>
        <header className="header">
          <h1>
            Planner2025
            {user ? ` — ¡Bienvenido, ${profileName || 'Usuario'}!` : ''}
          </h1>

          {profilePicUrl && (
            <img
              src={profilePicUrl}
              alt="Mi Perfil"
              className="profile-picture-header"
            />
          )}

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

          <nav>
            <ul className="nav-links">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive ? 'active nav-link' : 'nav-link'
                  }
                  onClick={playClickSound}
                >
                  <FaHome color="#fff" /> Home
                </NavLink>
              </li>

              {user ? (
                <>
                  <li>
                    <NavLink
                      to="/profile"
                      className={({ isActive }) =>
                        isActive ? 'active nav-link' : 'nav-link'
                      }
                      onClick={playClickSound}
                    >
                      <FaUser color="#fff" /> Perfil
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/tasks"
                      className={({ isActive }) =>
                        isActive ? 'active nav-link' : 'nav-link'
                      }
                      onClick={playClickSound}
                    >
                      <FaTasks color="#fff" /> Tareas
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/archived-tasks"
                      className={({ isActive }) =>
                        isActive ? 'active nav-link' : 'nav-link'
                      }
                      onClick={playClickSound}
                    >
                      <FaArchive color="#fff" /> Archivadas
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/task-metrics"
                      className={({ isActive }) =>
                        isActive ? 'active nav-link' : 'nav-link'
                      }
                      onClick={playClickSound}
                    >
                      <FaChartPie color="#fff" /> Métricas
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/friends"
                      className={({ isActive }) =>
                        isActive ? 'active nav-link' : 'nav-link'
                      }
                      onClick={playClickSound}
                    >
                      <FaUser color="#fff" /> Amigos
                    </NavLink>
                  </li>
                  {user.role === 'admin' && (
                    <li>
                      <NavLink
                        to="/admin"
                        className={({ isActive }) =>
                          isActive ? 'active nav-link' : 'nav-link'
                        }
                        onClick={playClickSound}
                      >
                        <FaUserShield color="#fff" /> Admin
                      </NavLink>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={() => {
                        playClickSound();
                        handleLogout();
                      }}
                      className="logout-button"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <NavLink
                      to="/login"
                      className={({ isActive }) =>
                        isActive ? 'active nav-link' : 'nav-link'
                      }
                      onClick={playClickSound}
                    >
                      <FaSignInAlt color="#fff" /> Iniciar Sesión
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/register"
                      className={({ isActive }) =>
                        isActive ? 'active nav-link' : 'nav-link'
                      }
                      onClick={playClickSound}
                    >
                      <FaUserPlus color="#fff" /> Registrarse
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </header>

        <ErrorBoundary>
          <div className="main-container">
            <Routes>
              <Route path="/" element={<HomePage />} />

              <Route
                path="/login"
                element={
                  !user ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/" />
                }
              />
              <Route
                path="/register"
                element={
                  !user ? <RegisterPage onLogin={handleLogin} /> : <Navigate to="/" />
                }
              />

              <Route
                path="/profile"
                element={user ? <ProfilePage /> : <Navigate to="/login" />}
              />
              <Route
                path="/tasks"
                element={user ? <TaskPage /> : <Navigate to="/login" />}
              />
              <Route
                path="/archived-tasks"
                element={user ? <ArchivedTasksPage /> : <Navigate to="/login" />}
              />
              <Route
                path="/task-metrics"
                element={user ? <TaskMetricsPage /> : <Navigate to="/login" />}
              />
              <Route
                path="/friends"
                element={user ? <FriendsPage /> : <Navigate to="/login" />}
              />

              {user && user.role === 'admin' && (
                <Route path="/admin" element={<AdminPage />} />
              )}

              {/* Ruta para manejar páginas no encontradas (404) */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </ErrorBoundary>

        <footer className="footer">© 2025 Planner2025. Construido con 💜</footer>
      </Router>
    </div>
  );
}

export default App;
