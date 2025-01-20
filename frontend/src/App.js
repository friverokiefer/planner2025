// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  NavLink, 
  Navigate
} from 'react-router-dom';
import TaskPage from './pages/TaskPage'; 
import ProfilePage from './pages/ProfilePage'; 
import FinancePage from './pages/FinancePage'; 
import ArchivedTasksPage from './pages/ArchivedTasksPage'; 
import TaskMetricsPage from './pages/TaskMetricsPage'; 
import HomePage from './pages/HomePage'; 
import LoginPage from './pages/LoginPage'; 
import RegisterPage from './pages/RegisterPage'; 
import AdminPage from './pages/AdminPage'; 
import './App.css'; 
import { 
  FaTasks, 
  FaUser, 
  FaChartLine, 
  FaArchive, 
  FaChartPie, 
  FaHome,
  FaSignInAlt,
  FaUserPlus,
  FaUserShield
} from 'react-icons/fa'; 
import authService from './services/authService'; 

function App() { 
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  return ( 
    <Router> 
      <header className="header"> 
        <h1>Planner2025</h1> 
        <nav> 
          <ul>
            <li>
              <NavLink to="/" className={({ isActive }) => isActive ? 'active' : undefined}>
                <FaHome color="#ffffff" /> Home
              </NavLink>
            </li> 
            {user ? (
              <>
                <li> 
                  <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : undefined}> 
                    <FaUser color="#ffffff" /> Profile 
                  </NavLink> 
                </li> 
                <li> 
                  <NavLink to="/tasks" className={({ isActive }) => isActive ? 'active' : undefined}> 
                    <FaTasks color="#ffffff" /> Tasks 
                  </NavLink> 
                </li> 
                <li className="submenu"> 
                  <NavLink to="/archived" className={({ isActive }) => isActive ? 'active' : undefined}> 
                    <FaArchive color="#ffffff" /> Archived 
                  </NavLink> 
                </li> 
                <li> 
                  <NavLink to="/metrics" className={({ isActive }) => isActive ? 'active' : undefined}> 
                    <FaChartPie color="#ffffff" /> Metrics 
                  </NavLink> 
                </li> 
                <li> 
                  <NavLink to="/finance" className={({ isActive }) => isActive ? 'active' : undefined}> 
                    <FaChartLine color="#ffffff" /> Finance 
                  </NavLink> 
                </li>
                {user.role === 'admin' && (
                  <li>
                    <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : undefined}>
                      <FaUserShield color="#ffffff" /> Admin
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
                  <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : undefined}>
                    <FaSignInAlt color="#ffffff" /> Login
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/register" className={({ isActive }) => isActive ? 'active' : undefined}>
                    <FaUserPlus color="#ffffff" /> Register
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
          <Route path="/tasks" element={user ? <TaskPage /> : <Navigate to="/login" />} /> 
          <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} /> 
          <Route path="/finance" element={user ? <FinancePage /> : <Navigate to="/login" />} /> 
          <Route path="/archived" element={user ? <ArchivedTasksPage /> : <Navigate to="/login" />} /> 
          <Route path="/metrics" element={user ? <TaskMetricsPage /> : <Navigate to="/login" />} /> 
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} /> 
          <Route path="/register" element={<RegisterPage onLogin={handleLogin} />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminPage /> : <Navigate to="/login" />} /> 
          <Route path="*" element={<Navigate to="/" />} /> {/* Redirigir a la página principal si no se encuentra la ruta */}
        </Routes> 
      </div> 
      <footer className="footer"> 
        © 2025 Planner2025. Built with 💜 by Felipe. 
      </footer> 
    </Router> 
  ); 
} 

export default App;
