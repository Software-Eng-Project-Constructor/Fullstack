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
import { useTheme } from "../context/ThemeContext"; // Import ThemeContext

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
  const { theme } = useTheme(); // Use theme context
  const [tasks, setTasks] = useState<Task[]>([]);

  // Define theme-specific styles
  const getThemeStyles = () => {
    if (theme === 'light') {
      return {
        // Main container
        mainBg: 'bg-white',
        mainShadow: 'shadow-md',
        mainText: 'text-gray-800',
        
        // Headers
        headerText: 'text-orange-500',
        subheaderText: 'text-gray-600',
        
        // Stats cards
        cardBg: 'bg-gray-50',
        cardShadow: 'shadow-sm',
        cardText: 'text-gray-800',
        cardValueText: 'text-gray-700',
        
        // Icons
        iconColor: 'text-orange-500',
      };
    } else {
      return {
        // Main container
        mainBg: 'bg-[#0F0F0F]',
        mainShadow: 'shadow-lg',
        mainText: 'text-gray-200',
        
        // Headers
        headerText: 'text-orange-500',
        subheaderText: 'text-gray-400',
        
        // Stats cards
        cardBg: 'bg-[#1C1D1D]',
        cardShadow: 'shadow-md',
        cardText: 'text-gray-200',
        cardValueText: 'text-gray-300',
        
        // Icons
        iconColor: 'text-orange-500',
      };
    }
  };

  const styles = getThemeStyles();

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
    <div className={`max-w-6xl mx-auto p-8 ${styles.mainBg} rounded-lg ${styles.mainShadow} ${styles.mainText}`}>
      <div className="mb-6 text-center">
        <h1 className={`text-3xl font-bold ${styles.headerText}`}>Project Overview</h1>
        <p className={styles.subheaderText}>Overview for Project ID: {projectId}</p>
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
            className={`${styles.cardBg} p-6 rounded-lg text-center ${styles.cardShadow}`}
          >
            <div className={`text-4xl ${styles.iconColor} mb-4`}>{item.icon}</div>
            <h3 className={`text-xl font-semibold mb-2 ${styles.cardText}`}>{item.label}</h3>
            <p className={styles.cardValueText}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverviewPage;