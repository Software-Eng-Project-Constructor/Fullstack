import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string;
  assignedTo: string;
  status: string;
}

interface TasksPageProps {
  projectId: number;
}

const TasksPage: React.FC<TasksPageProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    assignedTo: "",
    status: "Pending Approval",
    projectId,
  });
  const [showTaskModal, setShowTaskModal] = useState(false);
  const handleDeleteTask = async (taskId: number) => {
    await axios.delete(`http://localhost:5001/tasks/${taskId.toString()}`);
    setTasks(tasks.filter((task) => task.id !== taskId));
  };
  
  useEffect(() => {
    axios.get(`http://localhost:5001/tasks?projectId=${projectId}`).then((res) => {
      setTasks(res.data);
    });
  }, [projectId]);

  const handleAddTask = async () => {
    const res = await axios.post("http://localhost:5001/tasks", newTask);
    setTasks([...tasks, res.data]);
    setShowTaskModal(false);
    setNewTask({ ...newTask, title: "", description: "", assignedTo: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
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
              className="w-full mb-2 p-2 rounded bg-[#0F0F0F] text-white"
            />
            <input
              name="description"
              placeholder="Description"
              value={newTask.description}
              onChange={handleChange}
              className="w-full mb-2 p-2 rounded bg-[#0F0F0F] text-white"
            />
            <input
              name="assignedTo"
              placeholder="Assigned To"
              value={newTask.assignedTo}
              onChange={handleChange}
              className="w-full mb-2 p-2 rounded bg-[#0F0F0F] text-white"
            />
            <select
              name="status"
              value={newTask.status}
              onChange={handleChange}
              className="w-full mb-4 p-2 rounded bg-[#0F0F0F] text-white"
            >
              <option>Pending Approval</option>
              <option>Approved</option>
              <option>In Progress</option>
              <option>Status Negative</option>
            </select>
            <div className="flex justify-between">
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded"
                onClick={handleAddTask}
              >
                Create
              </button>
              
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
                onClick={() => setShowTaskModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

<ul className="space-y-4">
  {tasks.map((task) => (
    <li key={task.id} className="p-4 bg-[#1C1D1D] rounded shadow flex justify-between items-center">
      <div>
        <h3 className="text-lg text-orange-400">{task.title}</h3>
        <p className="text-gray-300">{task.description}</p>
        <p className="text-sm text-gray-400">
          Assigned to: {task.assignedTo} | Status: {task.status}
        </p>
      </div>
      <button
        onClick={() => handleDeleteTask(task.id)}
        className="text-red-600 hover:text-red-700 text-xl"
      >
        <FaTrash />
      </button>
    </li>
  ))}
</ul>


    </div>
  );
};

export default TasksPage;
