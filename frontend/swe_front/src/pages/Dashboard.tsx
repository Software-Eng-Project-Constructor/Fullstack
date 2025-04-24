import { useState, useEffect } from "react";
import axios from "axios";
// import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import OverviewPage from "./OverviewPage";
import TasksPage from "./TasksPage";
import Calendar from "./Calendar";
import Files from "./Files";
import { FaTimes } from "react-icons/fa";

// 👇 Make sure cookies (sessions) are sent bc this is a protected page
axios.defaults.withCredentials = true;

const API_URL = "http://localhost:5001";

interface Project {
  id: number;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Check session user on page load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${API_URL}/me`);
        setUser(res.data.user);
      } catch (err) {
        window.location.href = "/signin"; // Redirect if not authenticated
      }
    };
    checkAuth();
  }, []);

  // ✅ Fetch projects
  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      const response = await axios.get(`${API_URL}/projects`);
      setProjects(response.data);
      if (response.data.length > 0) {
        setActiveProjectId(response.data[0].id);
      }
    };

    fetchProjects();
  }, [user]);

  const handleAddProject = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const response = await axios.post(`${API_URL}/projects`, {
      name: newProjectName,
    });
    setProjects((prev) => [...prev, response.data]);
    setActiveProjectId(response.data.id);
    setNewProjectName("");
    setIsModalOpen(false);
  };

  const handleDeleteProject = async (projectId: number) => {
    await axios.delete(`${API_URL}/projects/${projectId}`);
    setProjects(projects.filter((project) => project.id !== projectId));
  };

  // ✅ Logout session
  const handleLogout = async () => {
    await axios.post(`${API_URL}/logout`);
    setUser(null);
    window.location.href = "/signin";
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* ✅ Top Navbar */}
        <div className="flex justify-between items-center p-4 bg-gray-900 border-b border-gray-800">
          <div className="ml-10 text-xl font-semibold text-white">Dashboard</div>
          {user && (
            <div className="flex items-center gap-4 text-white">
              <span className="text-sm">👋 {user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Project Tabs */}
        <div className="bg-[#1C1D1D] p-4 flex flex-wrap gap-2">
          {projects.map((project) => (
            <div key={project.id} className="relative">
              <button
                onClick={() => setActiveProjectId(project.id)}
                className={`px-4 py-2 rounded flex items-center justify-between space-x-2 ${
                  project.id === activeProjectId
                    ? "bg-orange-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <span>{project.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project.id);
                  }}
                  className="text-red-600 hover:text-red-700 text-lg"
                >
                  <FaTimes />
                </button>
              </button>
            </div>
          ))}

          <button
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center"
            onClick={() => setIsModalOpen(true)}
          >
            <span className="mr-2">+</span>
          </button>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-[#1C1D1D] p-6 rounded-lg w-96">
              <h3 className="text-white text-lg mb-4">Create New Project</h3>
              <input
                className="bg-[#0F0F0F] text-white w-full mb-4 p-2 rounded"
                type="text"
                placeholder="Project Name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded"
                  onClick={handleAddProject}
                >
                  Create
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-1 rounded"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="tab-content flex-1 overflow-y-auto p-4 bg-gray-900 text-white">
          {activeTab === "Overview" && activeProjectId && (
            <OverviewPage projectId={activeProjectId} />
          )}
          {activeTab === "Tasks" && activeProjectId && (
            <TasksPage projectId={activeProjectId} />
          )}
          {activeTab === "Calendar" && <Calendar />}
          {activeTab === "Files" && activeProjectId && (
            <Files projectId={activeProjectId} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
