import { useState } from 'react';
import './AdvancedFilters.css';

const AdvancedFilters = ({ applyFilters }) => {
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    status: '',
    assignedTo: '',
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApply = () => {
    applyFilters(filter);
  };

  const handleReset = () => {
    setFilter({
      startDate: '',
      endDate: '',
      status: '',
      assignedTo: '',
    });
    applyFilters({});
  };

  return (
    <div className="advanced-filters">
      <h4>Filtros Avanzados</h4>
      <div className="filter-group">
        <label htmlFor="startDate">Fecha de Inicio:</label>
        <input
          type="date"
          name="startDate"
          id="startDate"
          value={filter.startDate}
          onChange={handleChange}
        />
      </div>
      <div className="filter-group">
        <label htmlFor="endDate">Fecha de Finalización:</label>
        <input
          type="date"
          name="endDate"
          id="endDate"
          value={filter.endDate}
          onChange={handleChange}
        />
      </div>
      <div className="filter-group">
        <label htmlFor="status">Estado:</label>
        <select
          name="status"
          id="status"
          value={filter.status}
          onChange={handleChange}
        >
          <option value="">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="en progreso">En Progreso</option>
          <option value="completado">Completado</option>
        </select>
      </div>
      <div className="filter-group">
        <label htmlFor="assignedTo">Asignado a:</label>
        <input
          type="text"
          name="assignedTo"
          id="assignedTo"
          value={filter.assignedTo}
          onChange={handleChange}
          placeholder="Nombre de la persona"
        />
      </div>
      <div className="filter-buttons">
        <button type="button" onClick={handleApply}>
          Aplicar Filtros
        </button>
        <button type="button" onClick={handleReset} className="reset-button">
          Restablecer
        </button>
      </div>
    </div>
  );
};

export default AdvancedFilters;
