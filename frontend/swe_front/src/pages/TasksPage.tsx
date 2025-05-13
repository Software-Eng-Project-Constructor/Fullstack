import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import Swal from 'sweetalert2';
import { useTheme } from "../context/ThemeContext"; // Import ThemeContext

axios.defaults.withCredentials = true;

interface Task {
  id: string;
  projectId: number;
  title: string;
  description?: string;
  createdById: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface ProjectUser {
  id: string;
  role: string;
  projectId: number;
  user: User; // Nested user object
}
interface TasksPageProps {
  projectId: number;
  user: User | null;
}

const TasksPage: React.FC<TasksPageProps> = ({ projectId, user }) => {
  const { theme } = useTheme(); // Use theme context
  
  // Define theme-specific styles
  const getThemeStyles = () => {
    if (theme === 'light') {
      return {
        // Main container
        mainBg: 'bg-gray-100',
        textColor: 'text-gray-800',
        mutedText: 'text-gray-600',
        accent: 'text-orange-500',
        accentLight: 'text-orange-400',
        
        // Task cards
        cardBg: 'bg-white',
        cardText: 'text-gray-800',
        cardDescriptionText: 'text-gray-600',
        cardBorder: 'border border-gray-200',
        cardShadow: 'shadow-sm',
        
        // Modal
        modalBg: 'bg-white',
        modalOverlay: 'bg-black bg-opacity-50',
        
        // Form elements
        inputBg: 'bg-gray-50',
        inputBorder: 'border border-gray-300',
        inputText: 'text-gray-800',
        
        // Selection list
        selectionBg: 'bg-gray-50',
        selectionText: 'text-gray-800',
        selectionPlaceholder: 'text-gray-500',
      };
    } else {
      return {
        // Main container
        mainBg: 'bg-[#0F0F0F]',
        textColor: 'text-gray-200',
        mutedText: 'text-gray-400',
        accent: 'text-orange-500',
        accentLight: 'text-orange-400',
        
        // Task cards
        cardBg: 'bg-[#1C1D1D]',
        cardText: 'text-white',
        cardDescriptionText: 'text-gray-300',
        cardBorder: 'border border-gray-800',
        cardShadow: 'shadow-md',
        
        // Modal
        modalBg: 'bg-[#1C1D1D]',
        modalOverlay: 'bg-black bg-opacity-50',
        
        // Form elements
        inputBg: 'bg-[#0F0F0F]',
        inputBorder: 'border border-gray-700',
        inputText: 'text-white',
        
        // Selection list
        selectionBg: 'bg-[#0F0F0F]',
        selectionText: 'text-white',
        selectionPlaceholder: 'text-gray-500',
      };
    }
  };

  const styles = getThemeStyles();

  if (!user) return <p className="text-red-500">User not loaded</p>;

  // --- core state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignedMap, setAssignedMap] = useState<Record<string, User[]>>({});
  const [projectUsers, setProjectUsers] = useState<User[]>([]);

  // --- modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [assignedTo, setAssignedTo] = useState<string[]>([]); // selected user IDs in modal

  // fetch all tasks
  const fetchTasks = async () => {
    try {
      const res = await axios.get<Task[]>(
        `http://localhost:5001/api/tasks?projectId=${projectId}`
      );
      setTasks(res.data);

      // then fetch assigned users for each task
      const map: Record<string, User[]> = {};
      await Promise.all(
        res.data.map(async (t) => {
          const r = await axios.get<User[]>(
            `http://localhost:5001/api/tasks/${t.id}/users`
          );
          map[t.id] = r.data;
        })
      );
      setAssignedMap(map);
    } catch (err) {
      console.error("Error fetching tasks or assignments:", err);
    }
  };

  // fetch project users
  const fetchProjectUsers = async () => {
    try {
      const res = await axios.get<ProjectUser[]>(
        `http://localhost:5001/api/Teams/${projectId}`
      );
      console.log("Fetched Project users", res.data);

      // Extract the `user` object from each item in the response
      const users = res.data.map((item) => item.user);
      setProjectUsers(users); // Set the extracted users to the state
    } catch (err) {
      console.error("Error fetching project users:", err);
    }
  };

  useEffect(() => {
    fetchProjectUsers();
    fetchTasks();
  }, [projectId]);

  //vitor assigned to backend connection
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };
  const toggleAssign = (userId: string) => {
    setAssignedTo((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // create task with assignments
  const handleAddTask = async () => {
    const payload = {
      ...newTask,
      createdById: user.id,
      projectId,
      assignedTo: assignedTo, // Array of selected user IDs
    };

    console.log("Payload sent to backend:", payload);

    try {
      const res = await axios.post<Task>(
        "http://localhost:5001/api/tasks",
        payload
      );
      const created = res.data;
      setTasks((prev) => [...prev, created]);

      // Fetch assigned users for the created task
      const r2 = await axios.get<User[]>(
        `http://localhost:5001/api/tasks/${created.id}/users`
      );
      console.log("Assigned users fetched for task:", r2.data);

      setAssignedMap((m) => {
        const updatedMap = { ...m, [created.id]: r2.data };
        console.log("Updated assignedMap:", updatedMap);
        return updatedMap;
      });

      // Reset modal
      setShowTaskModal(false);
      setNewTask({ title: "", description: "" });
      setAssignedTo([]);

      // Show success notification
      Swal.fire({
        title: 'Success!',
        text: 'Task has been created successfully',
        icon: 'success',
        confirmButtonColor: '#f97316',
      });
    } catch (err) {
      console.error("Failed to create task:", err);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to create task',
        icon: 'error',
        confirmButtonColor: '#f97316',
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    // Add confirmation dialog
    const result = await Swal.fire({
      title: 'Delete Task',
      text: 'Are you sure you want to delete this task?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5001/api/tasks/${taskId}`);
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        setAssignedMap((m) => {
          const copy = { ...m };
          delete copy[taskId];
          return copy;
        });

        // Show success notification
        Swal.fire({
          title: 'Deleted!',
          text: 'Task has been deleted.',
          icon: 'success',
          confirmButtonColor: '#f97316',
        });
      } catch (err) {
        console.error("Failed to delete task:", err);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete task',
          icon: 'error',
          confirmButtonColor: '#f97316',
        });
      }
    }
  };

  return (
    <div className={`p-6 ${styles.mainBg} ${styles.textColor}`}>
      <h2 className={`text-2xl font-bold ${styles.accent} mb-4`}>Tasks</h2>

      <button
        onClick={() => setShowTaskModal(true)}
        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded mb-6"
      >
        + Add Task
      </button>

      {showTaskModal && (
        <div className={`fixed inset-0 ${styles.modalOverlay} flex justify-center items-center z-50`}>
          <div className={`${styles.modalBg} p-6 rounded-lg w-96 ${styles.textColor}`}>
            <input
              name="title"
              placeholder="Title"
              value={newTask.title}
              onChange={handleChange}
              className={`w-full mb-2 p-2 rounded ${styles.inputBg} ${styles.inputText} ${styles.inputBorder}`}
            />
            <input
              name="description"
              placeholder="Description"
              value={newTask.description}
              onChange={handleChange}
              className={`w-full mb-4 p-2 rounded ${styles.inputBg} ${styles.inputText} ${styles.inputBorder}`}
            />
            
              {/* <select
                name="status"
                value={newTask.status}
                onChange={handleChange}
                className={`w-full mb-4 p-2 rounded ${styles.inputBg} ${styles.inputText} ${styles.inputBorder}`}
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <input
                type="date"
                name="deadline"
                value={newTask.deadline}
                onChange={handleChange}
                className={`w-full mb-4 p-2 rounded ${styles.inputBg} ${styles.inputText} ${styles.inputBorder}`}
              /> */}
            {/* ─── Assigned To multi-select ───────────────────────────────── */}
            <div className="mb-4">
              <p className="mb-2">Assigned To:</p>
              <div className={`max-h-40 overflow-auto ${styles.selectionBg} p-2 rounded ${styles.inputBorder}`}>
                {projectUsers.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center mb-1 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={assignedTo.includes(u.id)}
                      onChange={() => toggleAssign(u.id)}
                    />
                    <span className={styles.selectionText}>{u.name}</span>
                  </label>
                ))}
                {projectUsers.length === 0 && (
                  <p className={styles.selectionPlaceholder}>No users in this project</p>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
                onClick={() => {
                  setShowTaskModal(false);
                  setAssignedTo([]);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded"
                onClick={handleAddTask}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <ul className="space-y-4">
        {tasks.map((task) => (
          <li key={task.id} className={`p-4 ${styles.cardBg} rounded ${styles.cardShadow} ${styles.cardBorder}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className={`text-lg ${styles.accentLight}`}>{task.title}</h3>
                <p className={styles.cardDescriptionText}>{task.description}</p>

                {/* ─── Show assigned users ─────────────────────────────────── */}
                <div className="mt-2">
                  <strong className={styles.mutedText}>Assigned:</strong>{" "}
                  <span className={styles.cardText}>
                    {assignedMap[task.id]?.length
                      ? assignedMap[task.id].map((u) => u.name).join(", ")
                      : "None"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDeleteTask(task.id)}
                className="text-red-600 hover:text-red-700 text-xl ml-4"
              >
                <FaTrash />
              </button>
            </div>
          </li>
        ))}
        
        {tasks.length === 0 && (
          <li className={`p-4 ${styles.cardBg} rounded ${styles.cardShadow} text-center ${styles.mutedText}`}>
            No tasks found. Click "Add Task" to create one.
          </li>
        )}
      </ul>
    </div>
  );
};

export default TasksPage;