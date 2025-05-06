import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import OverviewPage from "./OverviewPage";
import TasksPage from "./TasksPage";
import Calendar from "./Calendar";
import Files from "./Files";
import { FaTimes } from "react-icons/fa";
import axios from "axios";

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
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/auth/me`, { withCredentials: true }) // ✅ Explicitly required
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (user === null) {
      navigate("/signin");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    axios
      .get(`${API_URL}/api/projects`, { withCredentials: true }) // ✅ Add credentials
      .then((res) => {
        setProjects(res.data);
        if (res.data.length > 0) {
          setActiveProjectId(res.data[0].id);
        }
      });
  }, [user]);

  const handleAddProject = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const res = await axios.post(
      `${API_URL}/api/projects`,
      { name: newProjectName },
      { withCredentials: true } // ✅ Add credentials
    );
    setProjects((prev) => [...prev, res.data]);
    setActiveProjectId(res.data.id);
    setNewProjectName("");
    setIsModalOpen(false);
  };

  const handleDeleteProject = async (projectId: number) => {
    await axios.delete(`${API_URL}/api/projects/${projectId}`, {
      withCredentials: true, // ✅ Add credentials
    });
    setProjects((prev) => {
      const updated = prev.filter((p) => p.id !== projectId);
      if (updated.length === 0) {
        setActiveProjectId(null);
      } else if (projectId === activeProjectId) {
        setActiveProjectId(updated[0].id);
      }
      return updated;
    });
  };

  const handleLogout = async () => {
    await axios.post(`${API_URL}/api/auth/logout`, null, {
      withCredentials: true, // ✅ Add credentials
    });
    setUser(null);
    navigate("/signin");
  };

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <p>Loading...</p>
      </div>
    );
  }

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
        <div className="flex justify-between items-center p-4 bg-gray-900 border-b border-gray-800">
          <div className="ml-10 text-xl font-semibold text-white">
            Dashboard
          </div>
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

        <div className="bg-[#1C1D1D] p-4 flex flex-wrap gap-2">
          {projects.map((project) => (
            <div key={project.id} className="relative flex items-center">
              <button
                onClick={() => setActiveProjectId(project.id)}
                className={`px-4 py-2 rounded flex items-center justify-between space-x-2 ${
                  project.id === activeProjectId
                    ? "bg-orange-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <span>{project.name}</span>
              </button>

              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(project.id);
                }}
                className="ml-2 text-red-600 hover:text-red-700 text-lg cursor-pointer"
              >
                <FaTimes />
              </span>
            </div>
          ))}

          <button
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center"
            onClick={() => setIsModalOpen(true)}
          >
            <span className="mr-2">+</span>
          </button>
        </div>

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

        <div className="tab-content flex-1 overflow-y-auto p-4 bg-gray-900 text-white">
          {activeTab === "Overview" && activeProjectId && (
            <OverviewPage projectId={activeProjectId} />
          )}
          {activeTab === "Tasks" && activeProjectId && (
            <TasksPage projectId={activeProjectId} user={user} />
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