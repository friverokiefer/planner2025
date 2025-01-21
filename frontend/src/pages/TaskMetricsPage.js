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
import authService from '../services/authService'; // Para enviar el token

function TaskMetricsPage() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    stackedData: [], // priority/difficulty
  });
  const [error, setError] = useState(null);

  const pieColors = ['#28a745', '#ffc107', '#007bff'];
  const difficultyColors = ['#6f42c1', '#20c997', '#fd7e14', '#dc3545', '#17a2b8'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obtener user/token
        const user = authService.getCurrentUser();
        if (!user || !user.token) {
          throw new Error('No hay usuario logueado o token no disponible');
        }

        // Llamar al backend con Bearer token
        const response = await fetch('/api/tasks/stats', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
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

  // Pie chart
  const pieData = [
    { name: 'Completadas', value: stats.completed },
    { name: 'Pendientes', value: stats.pending },
    { name: 'En Progreso', value: stats.inProgress },
  ];

  // Evitar error forEach => fallback a []
  const safeStackedData = stats.stackedData || [];

  // Analizar keys difficulty_1, difficulty_2, ...
  const allKeys = new Set();
  safeStackedData.forEach((item) => {
    Object.keys(item).forEach((k) => {
      if (k.startsWith('difficulty_')) {
        allKeys.add(k);
      }
    });
  });
  const difficultyKeys = Array.from(allKeys).sort();

  return (
    <div className="container my-4">
      <h2 className="text-center">Task Metrics Dashboard</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="row">
        {/* Pie chart */}
        <div className="col-md-6">
          <h4 className="text-center">Estado de Tareas</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieColors[index % pieColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stacked Bar Chart */}
        <div className="col-md-6">
          <h4 className="text-center">Prioridad (Barras apiladas por Dificultad)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={safeStackedData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              {difficultyKeys.map((diffKey, idx) => (
                <Bar
                  key={diffKey}
                  dataKey={diffKey}
                  stackId="stack"
                  fill={difficultyColors[idx % difficultyColors.length]}
                  name={diffKey}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 p-3 bg-light">
        <p><strong>Total de Tareas:</strong> {stats.totalTasks}</p>
        <p><strong>Completadas:</strong> {stats.completed}</p>
        <p><strong>Pendientes:</strong> {stats.pending}</p>
        <p><strong>En Progreso:</strong> {stats.inProgress}</p>
      </div>
    </div>
  );
}

export default TaskMetricsPage;
