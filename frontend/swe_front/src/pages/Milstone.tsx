import { useEffect, useState } from 'react';
import { FaListCheck, FaCalendar, FaUsers, FaPlus } from 'react-icons/fa6';
import axios from 'axios';
import ProgressBar from '../components/progressbar';
import Swal from 'sweetalert2';
import { useTheme } from '../context/ThemeContext'; // Import ThemeContext

axios.defaults.withCredentials = true;

// Add axios interceptor to handle 401 errors globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Swal.fire({
        title: 'Session Expired',
        text: 'Your session has expired. Please log in again.',
        icon: 'warning',
        confirmButtonColor: '#f97316',
      }).then(() => {
        window.location.href = '/signin';
      });
    }
    return Promise.reject(error);
  }
);

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  assignedTo: string[];
  status: string;
}

interface Milestone {
  id: string;
  projectId: number;  // Changed from string to number to match database schema
  title: string;
  description: string;
  dueDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  tasks: Task[];
}

interface ProjectMilestonesProps {
  projectId: string;
}

const ProjectMilestones: React.FC<ProjectMilestonesProps> = ({ projectId }) => {
  const { theme } = useTheme(); // Use theme context
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({
    title: '',
    description: '',
    dueDate: '',
    status: 'Not Started',
    tasks: [],
  });
  const [showTaskModal, setShowTaskModal] = useState<string | null>(null);
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    title: '',
    description: '',
    assignedTo: [],
    completed: false,
    status: 'Pending',
  });
  const [contributors, setContributors] = useState<any[]>([]);

  // Define theme-specific styles
  const getThemeStyles = () => {
    if (theme === 'light') {
      return {
        // Main container
        mainBg: 'bg-white',
        containerShadow: 'shadow-md',
        headerText: 'text-gray-800',
        subheaderText: 'text-gray-600',
        normalText: 'text-gray-700',
        mutedText: 'text-gray-500',
        
        // Card styles
        cardBg: 'bg-gray-50',
        cardInnerBg: 'bg-white',
        cardInnerBgAlt: 'bg-gray-100',
        cardShadow: 'shadow-sm',
        cardBorder: 'border border-gray-200',
        
        // Form elements
        inputBg: 'bg-white',
        inputBorder: 'border-gray-300',
        inputText: 'text-gray-800',
        
        // Buttons
        buttonSecondary: 'bg-gray-300 hover:bg-gray-400',
        buttonSecondaryText: 'text-gray-800',
        
        // Task checkboxes
        checkboxBg: 'bg-white',
        checkboxBorder: 'border-gray-400',
        
        // Modal
        modalBg: 'bg-white',
        modalOverlay: 'bg-black bg-opacity-50',
      };
    } else {
      return {
        // Main container
        mainBg: 'bg-[#0F0F0F]',
        containerShadow: 'shadow-lg',
        headerText: 'text-orange-500',
        subheaderText: 'text-gray-400',
        normalText: 'text-gray-200',
        mutedText: 'text-gray-400',
        
        // Card styles
        cardBg: 'bg-[#1C1D1D]',
        cardInnerBg: 'bg-[#0F0F0F]',
        cardInnerBgAlt: 'bg-[#1C1D1D]',
        cardShadow: 'shadow-md',
        cardBorder: 'border border-gray-800',
        
        // Form elements
        inputBg: 'bg-[#0F0F0F]',
        inputBorder: 'border-gray-700',
        inputText: 'text-white',
        
        // Buttons
        buttonSecondary: 'bg-gray-600 hover:bg-gray-700',
        buttonSecondaryText: 'text-white',
        
        // Task checkboxes
        checkboxBg: 'bg-gray-800',
        checkboxBorder: 'border-gray-600',
        
        // Modal
        modalBg: 'bg-[#1C1D1D]',
        modalOverlay: 'bg-black bg-opacity-50',
      };
    }
  };

  const styles = getThemeStyles();

  useEffect(() => {
    const fetchContributors = async () => {
      const data = await getContributors();
      setContributors(data);
    };
    fetchContributors();
  }, [projectId]);

  useEffect(() => {
    setNewMilestone({
      title: '',
      description: '',
      dueDate: '',
      status: 'Not Started',
      tasks: [],
    });
  }, [projectId]);

  const calculateMilestoneProgress = (tasks: Task[]) => {
    if (!tasks?.length) return 0;
    const completedTasks = tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const calculateOverallProgress = () => {
    if (!milestones.length) return 0;
    const totalTasks = milestones.reduce((acc, m) => acc + (m.tasks?.length || 0), 0);
    if (totalTasks === 0) return 0;
    const completedTasks = milestones.reduce(
      (acc, m) => acc + (m.tasks?.filter(t => t.completed)?.length || 0),
      0
    );
    return Math.round((completedTasks / totalTasks) * 100);
  };

  const updateMilestoneStatus = async (milestoneId: string, tasks: Task[]) => {
    const progress = calculateMilestoneProgress(tasks);
    let newStatus: Milestone['status'] = 'Not Started';

    if (progress === 100) {
      newStatus = 'Completed';
    } else if (progress > 0) {
      newStatus = 'In Progress';
    }

    try {
      const response = await axios.patch(`/api/milestones/${milestoneId}`, {
        status: newStatus,
        tasks,
      });

      setMilestones(prev =>
        prev.map(m =>
          m.id === milestoneId ? { ...m, status: newStatus, tasks: response.data.tasks } : m
        )
      );
    } catch (error) {
      console.error('Error updating milestone status:', error);
    }
  };

  useEffect(() => {
    const fetchMilestones = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/milestones?projectId=${projectId}`);
        console.log('Fetched milestones:', response.data);
        setMilestones(response.data);
      } catch (error) {
        console.error('Error fetching milestones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, [projectId]);

  const handleAddMilestone = async () => {
    try {
      const milestone = {
        ...newMilestone,
        projectId: parseInt(projectId), // Convert string projectId to number
        id: Date.now().toString(),
        dueDate: new Date(newMilestone.dueDate!).toISOString(),
        tasks: [],
      };

      const response = await axios.post('/api/milestones', milestone);
      setMilestones(prev => [...prev, response.data]);

      await axios.post('/api/events', {
        id: Date.now().toString(),
        title: `Milestone Due: ${milestone.title}`,
        description: milestone.description,
        startDate: milestone.dueDate,
        endDate: milestone.dueDate,
        priority: 'high',
        category: 'milestone',
        milestoneId: milestone.id,
      });

      setShowModal(false);
      setNewMilestone({
        title: '',
        description: '',
        dueDate: '',
        status: 'Not Started',
        tasks: [],
      });

      Swal.fire({
        title: 'Success!',
        text: 'Milestone has been created successfully',
        icon: 'success',
        confirmButtonColor: '#f97316',
      });
    } catch (error) {
      console.error('Error adding milestone:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to create milestone',
        icon: 'error',
        confirmButtonColor: '#f97316',
      });
    }
  };

  const getContributors = async () => {
    try {
      const response = await axios.get(`/api/teams/${projectId}`);
      return response.data.map((member: any) => ({
        name: member.user.name,
        role: member.role,
      }));
    } catch (error) {
      console.error('Error fetching contributors:', error);
      return [];
    }
  };

  const handleAddTask = async (milestoneId: string) => {
    try {
      const milestone = milestones.find(m => m.id === milestoneId);
      if (!milestone) return;

      const newTaskData = {
        id: Date.now(),
        ...newTask,
        assignedTo: newTask.assignedTo || [],
        completed: false,
        status: 'Pending',
        projectId: milestone.projectId // Include the milestone's projectId
      };

      const updatedTasks = [...(milestone.tasks || []), newTaskData];

      await axios.patch(`/api/milestones/${milestoneId}`, {
        ...milestone,
        tasks: updatedTasks
      });

      setMilestones(prev =>
        prev.map(m => (m.id === milestoneId ? { ...m, tasks: updatedTasks } : m))
      );

      setShowTaskModal(null);
      setNewTask({
        title: '',
        description: '',
        assignedTo: [],
        completed: false,
        status: 'Pending',
      });

      Swal.fire({
        title: 'Success!',
        text: 'Task added successfully',
        icon: 'success',
        confirmButtonColor: '#f97316',
      });
    } catch (error) {
      console.error('Error adding task:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to add task',
        icon: 'error',
        confirmButtonColor: '#f97316',
      });
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    const result = await Swal.fire({
      title: 'Delete Milestone',
      text: 'Are you sure you want to delete this milestone and all its tasks?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        // Delete associated events first
        await axios.delete(`/api/events?milestoneId=${id}`);
        // Then delete the milestone
        await axios.delete(`/api/milestones/${id}`);

        setMilestones(prev => prev.filter(m => m.id !== id));

        Swal.fire({
          title: 'Deleted!',
          text: 'Milestone and its tasks have been deleted.',
          icon: 'success',
          confirmButtonColor: '#f97316',
        });
      } catch (error) {
        console.error('Error deleting milestone:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete the milestone.',
          icon: 'error',
          confirmButtonColor: '#f97316',
        });
      }
    }
  };

  const handleToggleTask = async (milestoneId: string, taskId: number) => {
    try {
      const milestone = milestones.find(m => m.id === milestoneId);
      if (!milestone) return;

      const updatedTasks = milestone.tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );

      await updateMilestoneStatus(milestoneId, updatedTasks);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-orange-500 text-xl">
          <div className="animate-spin mr-2 inline-block">⌛</div>
          Loading milestones...
        </div>
      </div>
    );
  }

  const overallProgress = calculateOverallProgress();

  return (
    <div className={`max-w-6xl mx-auto p-8 ${styles.mainBg} rounded-lg ${styles.containerShadow} ${styles.normalText}`}>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className={`text-3xl font-bold ${styles.headerText}`}>Project Milestones</h1>
            <p className={styles.subheaderText}>Project ID: {projectId}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaPlus /> Add Milestone
          </button>
        </div>

        <div className={`${styles.cardBg} p-4 rounded-lg mb-6 ${styles.cardShadow}`}>
          <div className="flex justify-between items-center mb-2">
            <h2 className={`text-lg font-semibold ${styles.headerText}`}>Overall Progress</h2>
            <span className={styles.mutedText}>{overallProgress}%</span>
          </div>
          <ProgressBar progress={overallProgress} />
        </div>
      </div>

      <div className="space-y-6">
        {milestones.map(milestone => (
          <div key={milestone.id} className={`${styles.cardBg} p-6 rounded-lg ${styles.cardShadow}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className={`text-xl font-bold ${styles.headerText}`}>{milestone.title}</h2>
                <p className={styles.mutedText + " mt-2"}>{milestone.description}</p>
                <div className={`flex items-center mt-2 text-sm ${styles.mutedText}`}>
                  <FaCalendar className="mr-2" />
                  Due: {new Date(milestone.dueDate).toLocaleDateString()}
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm ${styles.mutedText}`}>Progress</span>
                    <span className={`text-sm ${styles.mutedText}`}>
                      {calculateMilestoneProgress(milestone.tasks)}%
                    </span>
                  </div>
                  <ProgressBar progress={calculateMilestoneProgress(milestone.tasks)} />
                </div>
              </div>
              <div className="flex items-center gap-4 ml-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    milestone.status === 'Completed'
                      ? 'bg-green-600 text-green-100'
                      : milestone.status === 'In Progress'
                      ? 'bg-yellow-600 text-yellow-100'
                      : 'bg-gray-600 text-gray-100'
                  }`}
                >
                  {milestone.status}
                </span>
                <button
                  onClick={() => handleDeleteMilestone(milestone.id)}
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold flex items-center ${styles.normalText}`}>
                  <FaListCheck className="mr-2 text-orange-500" />
                  Tasks ({milestone.tasks?.length || 0})
                </h3>
                <button
                  onClick={() => setShowTaskModal(milestone.id)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-sm flex items-center"
                >
                  <FaPlus className="mr-1" /> Add Task
                </button>
              </div>

              {milestone.tasks && milestone.tasks.length > 0 && (
                <div className="space-y-3">
                  {milestone.tasks.map(task => (
                    <div key={task.id} className={`${styles.cardInnerBg} p-4 rounded-lg ${styles.cardBorder}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleTask(milestone.id, task.id)}
                            className={`w-4 h-4 text-orange-500 ${styles.checkboxBg} rounded ${styles.checkboxBorder} focus:ring-orange-500`}
                          />
                          <span
                            className={`ml-3 ${
                              task.completed ? 'line-through ' + styles.mutedText : styles.normalText
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>
                        <div className={`text-sm ${styles.mutedText}`}>
                          {task.assignedTo && task.assignedTo.length > 0 ? (
                            <div className="flex items-center">
                              <FaUsers className="mr-2" />
                              {task.assignedTo.join(', ')}
                            </div>
                          ) : (
                            'Unassigned'
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {milestones.length === 0 && (
          <div className={`text-center ${styles.mutedText} py-8`}>
            No milestones found for this project
          </div>
        )}
      </div>

      {showTaskModal && (
        <div className={`fixed inset-0 ${styles.modalOverlay} flex items-center justify-center z-50`}>
          <div className={`${styles.modalBg} p-6 rounded-lg w-96 ${styles.cardShadow}`}>
            <h3 className={`text-xl font-bold ${styles.headerText} mb-4`}>Add New Task to Milestone</h3>
            <input
              type="text"
              placeholder="Task Name"
              required
              value={newTask.title}
              onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full mb-3 p-2 ${styles.inputBg} border ${styles.inputBorder} rounded ${styles.inputText}`}
            />
            <textarea
              placeholder="Description"
              value={newTask.description}
              onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              className={`w-full mb-3 p-2 ${styles.inputBg} border ${styles.inputBorder} rounded ${styles.inputText}`}
              rows={3}
            />
            <select
              multiple
              onChange={e =>
                setNewTask(prev => ({
                  ...prev,
                  assignedTo: Array.from(e.target.selectedOptions).map(option => option.value),
                }))
              }
              className={`w-full mb-3 p-2 ${styles.inputBg} border ${styles.inputBorder} rounded ${styles.inputText}`}
              style={{ colorScheme: theme === 'light' ? 'light' : 'dark' }}
            >
              <option value="">Select Assignee (optional)</option>
              {contributors.map((c: { name: string; role: string }) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.role})
                </option>
              ))}
            </select>
            <p className={`text-sm ${styles.mutedText} mb-4`}>Task will inherit milestone's deadline</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowTaskModal(null)}
                className={`px-4 py-2 ${styles.buttonSecondary} ${styles.buttonSecondaryText} rounded`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddTask(showTaskModal)}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className={`fixed inset-0 ${styles.modalOverlay} flex items-center justify-center z-50`}>
          <div className={`${styles.modalBg} p-6 rounded-lg w-96 ${styles.cardShadow}`}>
            <h3 className={`text-xl font-bold ${styles.headerText} mb-4`}>Add New Milestone</h3>
            <input
              type="text"
              placeholder="Title"
              value={newMilestone.title}
              onChange={e => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full mb-3 p-2 ${styles.inputBg} border ${styles.inputBorder} rounded ${styles.inputText}`}
            />
            <textarea
              placeholder="Description"
              value={newMilestone.description}
              onChange={e => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
              className={`w-full mb-3 p-2 ${styles.inputBg} border ${styles.inputBorder} rounded ${styles.inputText}`}
            />
            <input
              type="date"
              value={newMilestone.dueDate}
              onChange={e => setNewMilestone(prev => ({ ...prev, dueDate: e.target.value }))}
              className={`w-full mb-3 p-2 ${styles.inputBg} border ${styles.inputBorder} rounded ${styles.inputText}`}
              style={{ colorScheme: theme === 'light' ? 'light' : 'dark' }}
            />
            <select
              value={newMilestone.status}
              onChange={e =>
                setNewMilestone(prev => ({
                  ...prev,
                  status: e.target.value as Milestone['status'],
                }))
              }
              className={`w-full mb-4 p-2 ${styles.inputBg} border ${styles.inputBorder} rounded ${styles.inputText}`}
              style={{ colorScheme: theme === 'light' ? 'light' : 'dark' }}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className={`px-4 py-2 ${styles.buttonSecondary} ${styles.buttonSecondaryText} rounded`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddMilestone}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Add Milestone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectMilestones;