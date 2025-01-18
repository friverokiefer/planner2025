// frontend/src/pages/TaskMetricsPage.js
import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { Alert } from 'react-bootstrap';

function TaskMetricsPage() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    priorityDistribution: {},
    difficultyDistribution: {},
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/tasks/stats');
        if (!response.ok) {
          throw new Error('Error al obtener estadísticas');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error al obtener estadísticas:', err);
        setError('Error al obtener estadísticas');
      }
    };

    fetchStats();
  }, []);

  const COLORS = ['#28a745', '#ffc107', '#dc3545', '#007bff'];

  const pieData = [
    { name: 'Completadas', value: stats.completed },
    { name: 'Pendientes', value: stats.pending },
    { name: 'En Progreso', value: stats.inProgress },
  ];

  // Usar Object.entries() de forma segura
  const priorityData = stats.priorityDistribution ?
    Object.entries(stats.priorityDistribution).map(
      ([priority, value]) => ({
        priority,
        value,
      })
    ) : [];

  const difficultyData = stats.difficultyDistribution ?
    Object.entries(stats.difficultyDistribution).map(
      ([difficulty, value]) => ({
        difficulty,
        value,
      })
    ) : [];

  return (
    <div className="profile-dashboard">
      <h2>Task Metrics Dashboard</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <div className="charts-container">
        <div className="chart-item">
          <h4>Estado de Tareas</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-item">
          <h4>Distribución por Prioridad</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={priorityData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Cantidad" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-item">
          <h4>Distribución por Dificultad</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={difficultyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="difficulty" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Cantidad" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="additional-stats">
        <p>Total de Tareas: {stats.totalTasks}</p>
        <p>Completadas: {stats.completed}</p>
        <p>Pendientes: {stats.pending}</p>
        <p>En Progreso: {stats.inProgress}</p>
      </div>
    </div>
  );
}

export default TaskMetricsPage;