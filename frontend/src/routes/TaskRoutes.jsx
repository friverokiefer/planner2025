// frontend/src/routes/TaskRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import TaskPage from '../pages/TaskPage/TaskPage';
import TaskTableView from '../components/TaskViews/TaskTableView/TaskTableView';
import ArchivedTasksPage from '../pages/ArchivedTasksPage/ArchivedTasksPage';
import TaskMetricsPage from '../pages/TaskMetricsPage/TaskMetricsPage';
import TaskDailyView from '../components/TaskViews/TaskDailyView/TaskDailyView';
import TaskWeeklyView from '../components/TaskViews/TaskWeeklyView/TaskWeeklyView';
import TaskMonthlyView from '../components/TaskViews/TaskMonthlyView/TaskMonthlyView';
import TaskWideView from '../components/TaskViews/TaskWideView/TaskWideView';
import TaskKanbanView from '../components/TaskViews/TaskKanbanView/TaskKanbanView';

const TaskRoutes = ({ user }) => {
  return (
    <Routes>
      <Route path="/" element={<TaskPage user={user} />} />
      <Route path="table" element={<TaskTableView />} />
      <Route path="archived" element={<ArchivedTasksPage />} />
      <Route path="metrics" element={<TaskMetricsPage />} />
      <Route path="daily" element={<TaskDailyView />} />
      <Route path="weekly" element={<TaskWeeklyView />} />
      <Route path="monthly" element={<TaskMonthlyView />} />
      <Route path="wide" element={<TaskWideView />} />
      <Route path="kanban" element={<TaskKanbanView />} />
    </Routes>
  );
};

export default TaskRoutes;
