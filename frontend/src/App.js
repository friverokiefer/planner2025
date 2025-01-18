// frontend/src/App.js
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  NavLink,
} from 'react-router-dom';
import TaskPage from './pages/TaskPage';
import ProfilePage from './pages/ProfilePage';
import FinancePage from './pages/FinancePage';
import ArchivedTasksPage from './pages/ArchivedTasksPage';
import TaskMetricsPage from './pages/TaskMetricsPage'; // Importa la nueva página
import './App.css';
import {
  FaTasks,
  FaUser,
  FaChartLine,
  FaArchive,
  FaChartPie,
} from 'react-icons/fa';

function App() {
  return (
    <Router>
      <header className="header">
        <h1>Planner2025</h1>
        <nav>
          <ul>
            <li>
              <NavLink to="/profile" activeClassName="active">
                <FaUser color="#ffffff" /> Profile
              </NavLink>
            </li>
            <li>
              <NavLink to="/" exact activeClassName="active">
                <FaTasks color="#ffffff" /> Tasks
              </NavLink>
            </li>
            <li className="submenu">
              <NavLink to="/archived" activeClassName="active">
                <FaArchive color="#ffffff" /> Archived
              </NavLink>
            </li>
            <li>
              <NavLink to="/metrics" activeClassName="active">
                <FaChartPie color="#ffffff" /> Metrics
              </NavLink>
            </li>
            <li>
              <NavLink to="/finance" activeClassName="active">
                <FaChartLine color="#ffffff" /> Finance
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>
      <div className="main-container">
        <Routes>
          <Route path="/" element={<TaskPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/archived" element={<ArchivedTasksPage />} />
          <Route path="/metrics" element={<TaskMetricsPage />} /> {/* Nueva ruta para métricas */}
        </Routes>
      </div>
      <footer className="footer">
        © 2025 Planner2025. Built with 💜 by Felipe.
      </footer>
    </Router>
  );
}

export default App;