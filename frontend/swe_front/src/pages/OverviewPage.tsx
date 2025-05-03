import React, { useEffect, useState } from "react";
import {
  FaChartLine,
  FaTasks,
  FaUsers,
  FaCogs,
  FaCalendarCheck,
  FaRocket,
} from "react-icons/fa";
import axios from "axios";

interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string;
  assignedTo: string;
  status: string;
}

interface OverviewPageProps {
  projectId: number;
}

const OverviewPage: React.FC<OverviewPageProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await axios.get(
        `http://localhost:5001/api/tasks?projectId=${projectId}`
      );
      setTasks(response.data);
    };

    fetchTasks();
  }, [projectId]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) =>
    ["Approved", "Status Negative"].includes(t.status)
  ).length;
  const progress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto p-8 bg-[#0F0F0F] rounded-lg shadow-lg text-gray-200">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-orange-500">Project Overview</h1>
        <p className="text-gray-400">Overview for Project ID: {projectId}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            icon: <FaChartLine />,
            label: "Progress",
            value: `${progress}% complete`,
          },
          { icon: <FaTasks />, label: "Total Tasks", value: totalTasks },
          { icon: <FaUsers />, label: "Team", value: "N/A" },
          { icon: <FaCogs />, label: "Config", value: "Up to date" },
          { icon: <FaCalendarCheck />, label: "Events", value: "Coming soon" },
          {
            icon: <FaRocket />,
            label: "Launch",
            value: progress >= 80 ? "On track" : "In progress",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-[#1C1D1D] p-6 rounded-lg text-center shadow-md"
          >
            <div className="text-4xl text-orange-500 mb-4">{item.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{item.label}</h3>
            <p className="text-gray-300">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverviewPage;
