// frontend/src/components/TaskViews/TaskKanbanView/KanbanSwitchController/KanbanSwitchController.jsx
import PropTypes from 'prop-types';
import './KanbanSwitchController.css';

const KanbanSwitchController = ({ grouping, setGrouping }) => {
  return (
    <div className="kanban-switch-controller">
      <label htmlFor="kanban-grouping">Agrupar por:</label>
      <select
        id="kanban-grouping"
        value={grouping}
        onChange={(e) => setGrouping(e.target.value)}
      >
        <option value="state">Estado</option>
        <option value="priority">Prioridad</option>
        <option value="difficulty">Dificultad</option>
      </select>
    </div>
  );
};

KanbanSwitchController.propTypes = {
  grouping: PropTypes.string.isRequired,
  setGrouping: PropTypes.func.isRequired,
};

export default KanbanSwitchController;
