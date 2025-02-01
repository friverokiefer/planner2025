// frontend/src/components/TaskMetricsPage.js
import { useState, useEffect } from 'react';
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
import { Alert, Form, Spinner } from 'react-bootstrap';

import authService from '../../services/authService';

function TaskMetricsPage() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    stackedData: [],
  });
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'owner' | 'collaborator' | 'all'
  const [loading, setLoading] = useState(true);

  const pieColors = ['#28a745', '#ffc107', '#007bff'];

  // **CORRESPONDENCIA CORRECTA DE PRIORIDADES**
  const priorityMap = {
    Low: 'Baja',
    Medium: 'Media',
    High: 'Alta',
  };

  // **CORRESPONDENCIA CORRECTA DE DIFICULTADES**
  const difficultyColors = {
    1: '#28a745', // Baja
    2: '#ffc107', // Media
    3: '#dc3545', // Alta
  };

  const difficultyNames = {
    1: 'Baja',
    2: 'Media',
    3: 'Alta',
  };

  useEffect(() => {
    // Función para transformar los datos al formato esperado por recharts
    const transformStackedData = data => {
      if (!data || data.length === 0) return [];

      // Mapeo de prioridades en inglés a español
      const translatedPriorities = ['Low', 'Medium', 'High'].map(
        priority => priorityMap[priority]
      );

      // Obtener todos los niveles de dificultad presentes
      const difficulties = Array.from(new Set(data.map(item => item.difficulty))).sort();

      // Inicializar un objeto para acumular los datos
      const dataMap = translatedPriorities.map(priority => {
        const item = { priority };
        difficulties.forEach(difficulty => {
          item[difficulty] = 0; // Inicializar en 0
        });
        return item;
      });

      // Rellenar los datos con los conteos correspondientes
      data.forEach(entry => {
        const translatedPriority = priorityMap[entry.priority];
        const dataEntry = dataMap.find(item => item.priority === translatedPriority);
        if (dataEntry) {
          dataEntry[entry.difficulty] = parseInt(entry.count, 10);
        }
      });

      console.log('Datos transformados:', dataMap);
      return dataMap;
    };

    const fetchStats = async () => {
      setLoading(true);
      try {
        const user = authService.getCurrentUser();
        if (!user || !user.token) {
          throw new Error('No hay usuario logueado o token no disponible');
        }
        const response = await fetch(`/api/tasks/stats?filter=${filter}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Error al obtener estadísticas');
        }
        const data = await response.json();
        console.log('Datos recibidos del backend:', data);

        // Transformar stackedData
        const transformedStackedData = transformStackedData(data.stackedData);
        setStats({ ...data, stackedData: transformedStackedData });
        setError(null);
      } catch (err) {
        console.error('Error al obtener estadísticas:', err);
        setError('Error al obtener estadísticas');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [filter]); // Ahora, transformStackedData está dentro del useEffect

  // Filtrar las dificultades que tienen al menos una tarea en alguna prioridad
  const activeDifficulties = Object.keys(difficultyColors).filter(difficulty => {
    return stats.stackedData.some(data => data[difficulty] > 0);
  });

  console.log('Dificultades activas:', activeDifficulties);

  // Pie chart
  const pieData = [
    { name: 'Completadas', value: stats.completed },
    { name: 'Pendientes', value: stats.pending },
    { name: 'En Progreso', value: stats.inProgress },
  ];

  return (
    <div className="container my-4">
      <h2 className="text-center">Task Metrics Dashboard</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading && (
        <div className="text-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </div>
      )}
      {!loading && (
        <>
          {/* Selector de filtro */}
          <Form.Group className="mb-3">
            <Form.Label>Filtrar Tareas por Rol</Form.Label>
            <Form.Select value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">Todo</option>
              <option value="owner">Solo Owner</option>
              <option value="collaborator">Solo Colaborador</option>
            </Form.Select>
          </Form.Group>

          <div className="row mt-4">
            {/* Pie chart */}
            <div className="col-md-6 mb-4">
              <h4 className="text-center">Estado de Tareas</h4>
              {pieData.reduce((acc, curr) => acc + curr.value, 0) === 0 ? (
                <p className="text-center">No hay datos para mostrar.</p>
              ) : (
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
              )}
            </div>

            {/* Stacked Bar Chart */}
            <div className="col-md-6 mb-4">
              <h4 className="text-center">
                Prioridad (Barras apiladas por Dificultad)
              </h4>
              {stats.stackedData.length === 0 ? (
                <p className="text-center">No hay datos para mostrar.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={stats.stackedData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="priority" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    {/* Solo renderizar barras para las dificultades activas */}
                    {activeDifficulties.map(difficulty => (
                      <Bar
                        key={difficulty}
                        dataKey={difficulty}
                        stackId="a"
                        fill={difficultyColors[difficulty]}
                        name={difficultyNames[difficulty]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Resumen de Tareas */}
          <div className="mt-4 p-3 bg-light rounded">
            <h5>Resumen de Tareas</h5>
            <p>
              <strong>Total de Tareas:</strong> {stats.totalTasks}
            </p>
            <p>
              <strong>Completadas:</strong> {stats.completed}
            </p>
            <p>
              <strong>Pendientes:</strong> {stats.pending}
            </p>
            <p>
              <strong>En Progreso:</strong> {stats.inProgress}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default TaskMetricsPage;
