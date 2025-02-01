// frontend/src/pages/TaskPage/TaskPage.js
import { useState, useEffect } from 'react';
import { Button, Card, Alert, Row, Col } from 'react-bootstrap';
import ViewSwitchButton from '../../components/ViewSwitchButton/ViewSwitchButton';
import TaskListView from '../../components/TaskViews/TaskListView/TaskListView';
import TaskTableView from '../../components/TaskViews/TaskTableView/TaskTableView';
import TaskWideView from '../../components/TaskViews/TaskWideView/TaskWideView';
import TaskKanbanView from '../../components/TaskViews/TaskKanbanView/TaskKanbanView';
import TaskDailyView from '../../components/TaskViews/TaskDailyView/TaskDailyView';
import TaskWeeklyView from '../../components/TaskViews/TaskWeeklyView/TaskWeeklyView';
import TaskMonthlyView from '../../components/TaskViews/TaskMonthlyView/TaskMonthlyView';
import AdvancedFilters from '../../components/AdvancedFilters/AdvancedFilters';
import WorkloadSummary from '../../components/WorkloadSummary/WorkloadSummary';
import TaskRedistribution from '../../components/TaskRedistribution/TaskRedistribution';
import TaskForm from '../../components/TaskForm/TaskForm';
import { getTasks, getTasksByPeriod, updateTask, createTask } from '../../services/taskService';
import './TaskPage.css';

const TaskPage = () => {
  const [currentView, setCurrentView] = useState('list');
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [capacity] = useState(8);
  const [showRedistribution, setShowRedistribution] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllTasks();
  }, []);

  const fetchAllTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data);
      setFilteredTasks(response.data);
    } catch (err) {
      console.error('Error fetching all tasks:', err);
      setError('Error fetching tasks');
    }
  };

  const handleSelectPeriod = async (period, customStartDate, customEndDate) => {
    try {
      const response = await getTasksByPeriod(period, customStartDate, customEndDate);
      setFilteredTasks(response.data);
    } catch (err) {
      console.error(`Error fetching tasks for period ${period}:`, err);
      setError(`Error fetching tasks for period ${period}`);
    }
  };

  const handleApplyFilters = async filters => {
    try {
      const response = await getTasks();
      const allTasks = response.data;
      const filtered = allTasks.filter(task => {
        const taskStartDate = new Date(task.start_date);
        const filterStartDate = filters.startDate ? new Date(filters.startDate) : null;
        const filterEndDate = filters.endDate ? new Date(filters.endDate) : null;
        const dateInRange =
          (!filterStartDate || taskStartDate >= filterStartDate) &&
          (!filterEndDate || taskStartDate <= filterEndDate);
        const statusMatches = !filters.status || task.state === filters.status;
        const assignedToMatches =
          !filters.assignedTo ||
          (task.assigned_to &&
            task.assigned_to.toLowerCase().includes(filters.assignedTo.toLowerCase()));
        return dateInRange && statusMatches && assignedToMatches;
      });
      setFilteredTasks(filtered);
    } catch (err) {
      console.error('Error applying advanced filters:', err);
      setError('Error applying filters');
    }
  };

  const handleRedistribute = () => {
    setShowRedistribution(true);
  };

  const handleUpdateTask = async updatedTask => {
    try {
      const response = await updateTask(updatedTask.id, updatedTask);
      const updatedTasks = tasks.map(task =>
        task.id === updatedTask.id ? response.data : task
      );
      setTasks(updatedTasks);
      setFilteredTasks(updatedTasks);
      setShowRedistribution(false);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Error updating task');
    }
  };

  const handleCreateTask = async newTask => {
    try {
      const response = await createTask(newTask);
      const allTasks = [...tasks, response.data];
      setTasks(allTasks);
      setFilteredTasks(allTasks);
      setShowTaskForm(false);
      setError(null);
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Error creating task');
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleChangeView = view => {
    setCurrentView(view);
  };

  return (
    <div className="task-page">
      <div className="task-content">
        <Card>
          <Card.Header as="h5">
            <div className="d-flex justify-content-between align-items-center">
              <Button onClick={() => setShowTaskForm(!showTaskForm)} variant="success">
                {showTaskForm ? 'Hide Task Form' : 'Create New Task'}
              </Button>
              <ViewSwitchButton currentView={currentView} onChangeView={handleChangeView} />
            </div>
          </Card.Header>
          <Card.Body>
            {showTaskForm && <TaskForm onTaskAdded={handleCreateTask} />}
            <Button onClick={toggleFilters} variant="secondary" className="mb-2">
              {showFilters ? 'Hide Filters' : 'Show Advanced Filters'}
            </Button>
            {showFilters && <AdvancedFilters applyFilters={handleApplyFilters} />}
            <WorkloadSummary tasks={filteredTasks} capacity={capacity} onRedistribute={handleRedistribute} />
            {showRedistribution && (
              <TaskRedistribution
                tasks={filteredTasks.filter(task => task.time_estimated > capacity)}
                onUpdateTasks={handleUpdateTask}
              />
            )}
            {error && <Alert variant="danger">{error}</Alert>}
            <Row>
              <Col>
                {currentView === 'list' && <TaskListView tasks={filteredTasks} setTasks={setTasks} />}
                {currentView === 'table' && (
                  <TaskTableView
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={id => setTasks(prev => prev.filter(t => t.id !== id))}
                  />
                )}
                {currentView === 'wide' && (
                  <TaskWideView
                    tasks={filteredTasks}
                    onComplete={handleUpdateTask}
                    onDelete={id => setTasks(prev => prev.filter(t => t.id !== id))}
                    onEdit={handleUpdateTask}
                    onArchive={handleUpdateTask}
                    onUnarchive={handleUpdateTask}
                    setTasks={setTasks}
                  />
                )}
                {currentView === 'kanban' && (
                  <TaskKanbanView
                    tasks={filteredTasks}
                    onEdit={handleUpdateTask}
                    onComplete={handleUpdateTask}
                    onDelete={id => setTasks(prev => prev.filter(t => t.id !== id))}
                    onArchive={handleUpdateTask}
                    onUnarchive={handleUpdateTask}
                    setTasks={setTasks}
                  />
                )}
                {currentView === 'daily' && (
                  <TaskDailyView
                    onComplete={handleUpdateTask}
                    onDelete={id => setTasks(prev => prev.filter(t => t.id !== id))}
                    onEdit={handleUpdateTask}
                    onArchive={handleUpdateTask}
                    onUnarchive={handleUpdateTask}
                  />
                )}
                {currentView === 'weekly' && (
                  <TaskWeeklyView
                    onComplete={handleUpdateTask}
                    onDelete={id => setTasks(prev => prev.filter(t => t.id !== id))}
                    onEdit={handleUpdateTask}
                    onArchive={handleUpdateTask}
                    onUnarchive={handleUpdateTask}
                  />
                )}
                {currentView === 'monthly' && (
                  <TaskMonthlyView
                    onComplete={handleUpdateTask}
                    onDelete={id => setTasks(prev => prev.filter(t => t.id !== id))}
                    onEdit={handleUpdateTask}
                    onArchive={handleUpdateTask}
                    onUnarchive={handleUpdateTask}
                  />
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default TaskPage;