import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";

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

  // handle modal input
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
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await axios.delete(`http://localhost:5001/api/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setAssignedMap((m) => {
        const copy = { ...m };
        delete copy[taskId];
        return copy;
      });
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  return (
    <div className="p-6 bg-[#0F0F0F] text-gray-200">
      <h2 className="text-2xl font-bold text-orange-500 mb-4">Tasks</h2>

      <button
        onClick={() => setShowTaskModal(true)}
        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded mb-6"
      >
        + Add Task
      </button>

      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#1C1D1D] p-6 rounded-lg w-96 text-white">
            <input
              name="title"
              placeholder="Title"
              value={newTask.title}
              onChange={handleChange}
              className="w-full mb-2 p-2 rounded bg-[#0F0F0F]"
            />
            <input
              name="description"
              placeholder="Description"
              value={newTask.description}
              onChange={handleChange}
              className="w-full mb-4 p-2 rounded bg-[#0F0F0F]"
            />

            {/* ─── Assigned To multi-select ───────────────────────────────── */}
            <div className="mb-4">
              <p className="mb-2">Assigned To:</p>
              <div className="max-h-40 overflow-auto bg-[#0F0F0F] p-2 rounded">
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
                    {u.name}
                  </label>
                ))}
                {projectUsers.length === 0 && (
                  <p className="text-gray-500">No users in this project</p>
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
          <li key={task.id} className="p-4 bg-[#1C1D1D] rounded shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg text-orange-400">{task.title}</h3>
                <p className="text-gray-300">{task.description}</p>

                {/* ─── Show assigned users ─────────────────────────────────── */}
                <div className="mt-2">
                  <strong className="text-gray-400">Assigned:</strong>{" "}
                  {assignedMap[task.id]?.length
                    ? assignedMap[task.id].map((u) => u.name).join(", ")
                    : "None"}
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
      </ul>
    </div>
  );
};

export default TasksPage;
