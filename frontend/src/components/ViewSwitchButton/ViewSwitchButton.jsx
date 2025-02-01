import React from 'react';
import PropTypes from 'prop-types';
import './ViewSwitchButton.css';

const ViewSwitchButton = ({ currentView, onChangeView }) => {
  // Opciones disponibles de vista
  const viewOptions = [
    { value: 'list', label: 'Vista Lista' },
    { value: 'table', label: 'Vista Tabla' },
    { value: 'kanban', label: 'Vista Kanban' },
    { value: 'wide', label: 'Vista Amplia' },
    { value: 'daily', label: 'Vista Diaria' },
    { value: 'weekly', label: 'Vista Semanal' },
    { value: 'monthly', label: 'Vista Mensual' },
  ];

  const handleChange = (e) => {
    onChangeView(e.target.value);
  };

  return (
    <div className="view-switcher">
      <label htmlFor="view-switcher-select">Cambiar Vista:</label>
      <select
        id="view-switcher-select"
        className="view-switcher-select"
        value={currentView}
        onChange={handleChange}
      >
        {viewOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

ViewSwitchButton.propTypes = {
  currentView: PropTypes.string.isRequired,
  onChangeView: PropTypes.func.isRequired,
};

export default ViewSwitchButton;
