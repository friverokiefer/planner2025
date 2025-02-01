// frontend/src/App.js
import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
} from 'react-router-dom';

import TaskRoutes from './routes/TaskRoutes';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import ArchivedTasksPage from './pages/ArchivedTasksPage/ArchivedTasksPage';
import TaskMetricsPage from './pages/TaskMetricsPage/TaskMetricsPage';
import FriendsPage from './pages/FriendsPage/FriendsPage';
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import AdminPage from './pages/AdminPage/AdminPage';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

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
import useSound from './hooks/useSound';
import clickSoundFile from './assets/sounds/notification-pluck-on-269288.mp3';

function App() {
  const [user, setUser] = useState(null); // Estado inicial en null
  const [theme, setTheme] = useState('default');
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [profileName, setProfileName] = useState('');

  // Sonido click
  const playClickSound = useSound(clickSoundFile);

  // Cargar usuario al montar el componente
  useEffect(() => {
    const loadUser = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        await fetchProfileData(currentUser.token);
      } else {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  // Obtener datos de perfil
  const fetchProfileData = async token => {
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

  // Manejo login (actualizado para usar authService directamente)
  const handleLogin = async (userDataOrToken) => {
    // Aquí se puede recibir directamente un token (como en LoginPage)
    // o un objeto usuario (como se obtiene en RegisterPage)
    // En ambos casos se actualizará el estado
    if (typeof userDataOrToken === 'string') {
      // Es un token
      authService.login(userDataOrToken);
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        await fetchProfileData(currentUser.token);
      }
    } else {
      // Se asume que ya es un objeto usuario
      setUser(userDataOrToken);
      await fetchProfileData(userDataOrToken.token);
    }
  };

  // Manejo logout
  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setProfilePicUrl(null);
    setProfileName('');
  };

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
              onChange={e => setTheme(e.target.value)}
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
              {/* Si el usuario está autenticado, redirige de "/" a "/profile" */}
              <Route
                path="/"
                element={user ? <Navigate to="/profile" /> : <HomePage />}
              />
              <Route
                path="/login"
                element={
                  !user ? (
                    <LoginPage onLogin={handleLogin} />
                  ) : (
                    <Navigate to="/profile" />
                  )
                }
              />
              <Route
                path="/register"
                element={
                  !user ? (
                    <RegisterPage onLogin={handleLogin} />
                  ) : (
                    <Navigate to="/profile" />
                  )
                }
              />
              <Route
                path="/profile"
                element={user ? <ProfilePage /> : <Navigate to="/login" />}
              />
              <Route
                path="/tasks/*"
                element={
                  user ? <TaskRoutes user={user} /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/archived-tasks"
                element={
                  user ? <ArchivedTasksPage /> : <Navigate to="/login" />
                }
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
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </ErrorBoundary>

        <footer className="footer">
          © 2025 Planner2025. Construido con 💜
        </footer>
      </Router>
    </div>
  );
}

export default App;
