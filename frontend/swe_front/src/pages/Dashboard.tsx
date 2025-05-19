import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import OverviewPage, { OverviewPageProps } from "./OverviewPage";
import TasksPage from "./TasksPage";
import MembersPage from "./MembersPage";
import Calendar from "./Calendar";
import Files from "./Files";
import Settings from "./Settings";
import ProjectMilestones from "./Milstone";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import { useTheme } from "../context/ThemeContext";

axios.defaults.withCredentials = true;
const API_URL = "http://localhost:5001";

interface Project {
  id: number;
  name: string;
  ownerId: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  privilege: string;
  profilePicPath?: string;
}

interface UserPayload {
  id: string;
  name: string;
  email: string;
  description?: string;
  theme?: string;
  audioNotification?: boolean;
  profilePicPath?: string;
}

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const [ownedProjects, setOwnedProjects] = useState<Project[]>([]);
  const [memberProjects, setMemberProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    axios
      .get(`${API_URL}/api/auth/me`, { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (user === null) {
      navigate("/signin");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchProfilePic = async () => {
      try {
        const res = await axios.get<UserPayload>(
          `${API_URL}/api/users/me/full`,
          {
            withCredentials: true,
          }
        );
        const fullUser = res.data;

        setUser((currentUser) => {
          if (!currentUser) return null;
          return {
            ...currentUser,
            profilePicPath: fullUser.profilePicPath || undefined,
          };
        });
      } catch (err) {
        console.error("Failed to fetch full user data for profile pic:", err);
      }
    };

    fetchProfilePic();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Fetch owned projects
    axios
      .get(`${API_URL}/api/projects`, { withCredentials: true })
      .then((res) => {
        setOwnedProjects(res.data);
        if (res.data.length > 0 && !activeProjectId) {
          setActiveProjectId(res.data[0].id);
        }
      });

    // Fetch all projects (including member projects)
    axios
      .get(`${API_URL}/api/projects/all`, { withCredentials: true })
      .then((res) => {
        const allProjects = res.data;
        const memberProjects = allProjects.filter(
          (project: Project) => project.ownerId !== user.id
        );
        setMemberProjects(memberProjects);
        if (allProjects.length > 0 && !activeProjectId) {
          setActiveProjectId(allProjects[0].id);
        }
      });
  }, [user, activeProjectId]);

  const handleAddProject = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const res = await axios.post(
        `${API_URL}/api/projects`,
        { name: newProjectName },
        { withCredentials: true }
      );
      setOwnedProjects((prev) => [...prev, res.data]);
      setActiveProjectId(res.data.id);
      setNewProjectName("");
      setIsModalOpen(false);

      // Show success notification
      Swal.fire({
        title: "Success!",
        text: "Project has been created successfully",
        icon: "success",
        confirmButtonColor: "#f97316",
      });
    } catch (error) {
      console.error("Error creating project:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to create project",
        icon: "error",
        confirmButtonColor: "#f97316",
      });
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    // Add confirmation dialog
    const result = await Swal.fire({
      title: "Delete Project",
      text: "Are you sure you want to delete this project? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/api/projects/${projectId}`, {
          withCredentials: true,
        });
        setOwnedProjects((prev) => {
          const updated = prev.filter((p) => p.id !== projectId);
          if (updated.length === 0) {
            setActiveProjectId(null);
          } else if (projectId === activeProjectId) {
            setActiveProjectId(updated[0].id);
          }
          return updated;
        });

        // Show success notification
        Swal.fire({
          title: "Deleted!",
          text: "Project has been deleted successfully",
          icon: "success",
          confirmButtonColor: "#f97316",
        });
      } catch (error) {
        console.error("Error deleting project:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete project",
          icon: "error",
          confirmButtonColor: "#f97316",
        });
      }
    }
  };

  const handleLogout = async () => {
    await axios.post(`${API_URL}/api/auth/logout`, null, {
      withCredentials: true,
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        mainBg: "bg-white",
        headerBg: "bg-gray-100",
        headerBorder: "border-gray-300",
        projectSectionBg: "bg-gray-200",
        cardBg: "bg-gray-100",
        modalBg: "bg-white",
        inputBg: "bg-gray-100",
        textColor: "text-gray-900",
        headerTextColor: "text-gray-800",
        tabContentBg: "bg-gray-50",
      };
    } else {
      return {
        mainBg: "bg-[#141414]",
        headerBg: "bg-[#1A1A1A]",
        headerBorder: "border-[#2A2A2A]",
        projectSectionBg: "bg-[#181818]",
        cardBg: "bg-[#202020]",
        modalBg: "bg-[#202020]",
        inputBg: "bg-[#252525]",
        textColor: "text-gray-200",
        headerTextColor: "text-white",
        tabContentBg: "bg-[#191919]",
      };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <div className={`flex h-screen flex-1 w-screen ${themeClasses.mainBg}`}>
      <Sidebar
        isOpen={isSidebarOpen}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div className="flex flex-1 flex-col transition-all duration-300 pt-5">
        <div
          className={`flex justify-between items-center p-4 pt-6 pb-6 ${themeClasses.headerBg} border-b ${themeClasses.headerBorder}`}
        >
          <div
            className={`ml-7 text-xl font-semibold ${themeClasses.headerTextColor}`}
          >
            Dashboard
          </div>
          {user && (
            <div
              className={`flex items-center gap-4 ${themeClasses.headerTextColor}`}
            >
              <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                {user.profilePicPath ? (
                  user.profilePicPath.startsWith("data:image/") ? (
                    <img
                      src={user.profilePicPath}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={`http://localhost:5001${user.profilePicPath}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs" />
                )}
              </div>
              <span className="text-sm">Welcome, {user.name}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm mr-7"
              >
                Logout
              </button>
            </div>
          )}
        </div>
        <div className={`${themeClasses.projectSectionBg} p-4`}>
          <div className="flex items-center gap-6 flex-wrap mx-7 my-4">
            {/* Owned Projects */}
            <div className="flex items-center gap-3">
              {ownedProjects.map((project) => (
                <div
                  key={project.id}
                  className="relative flex items-center gap-2"
                >
                  <button
                    onClick={() => setActiveProjectId(project.id)}
                    className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 shadow-sm border ${
                      project.id === activeProjectId
                        ? "bg-orange-600 text-white scale-105 z-10"
                        : theme === "light"
                          ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    <span className="whitespace-nowrap">{project.name}</span>
                  </button>

                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    className=" z-20 text-red-600 hover:text-red-700 text-base cursor-pointer"
                    title="Delete project"
                  >
                    <FaTimes />
                  </span>
                </div>
              ))}
            </div>

            {/* Member Projects */}
            <div className="flex items-center gap-2 border-l border-gray-600 pl-4">
              {memberProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setActiveProjectId(project.id)}
                  className={`px-4 py-2 rounded-md border border-dashed transition-all duration-200 ${
                    project.id === activeProjectId
                      ? "border-orange-600 text-orange-500 scale-105 bg-gray-900"
                      : theme === "light"
                        ? "border-gray-400 text-gray-800 hover:bg-gray-200"
                        : "border-gray-600 text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  {project.name}
                </button>
              ))}
            </div>

            {/* Add Project */}
            <div className="ml-auto">
              <button
                type="button"
                className="bg-[#f97316] hover:bg-[#ea580c] text-white px-4 py-2 rounded shadow-sm"
                onClick={() => setIsModalOpen(true)}
              >
                + New
              </button>
            </div>
          </div>

          {/* Modal – SAME AS ORIGINAL */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 ">
              <div className={`${themeClasses.modalBg} p-6 rounded-lg w-96`}>
                <h3 className={`${themeClasses.textColor} text-lg mb-4`}>
                  Create New Project
                </h3>
                <input
                  className={`${themeClasses.inputBg} ${
                    theme === "light" ? "text-gray-800" : "text-white"
                  } w-full mb-4 p-2 rounded border ${
                    theme === "light" ? "border-gray-300" : "border-gray-700"
                  }`}
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
        </div>

        <div
          className={`tab-content flex-1 overflow-y-auto p-4 mx-7 ${themeClasses.tabContentBg} ${themeClasses.textColor}`}
        >
          {activeTab === "Overview" && activeProjectId && (
            <OverviewPage
              projectId={activeProjectId}
              onTabChange={setActiveTab}
            />
          )}
          {activeTab === "Members" && activeProjectId && user && (
            <MembersPage projectId={activeProjectId} user={user} />
          )}
          {activeTab === "Tasks" && activeProjectId && (
            <TasksPage projectId={activeProjectId} user={user} />
          )}
          {activeTab === "Milestones" && activeProjectId && (
            <ProjectMilestones projectId={activeProjectId.toString()} />
          )}
          {activeTab === "Calendar" && activeProjectId && (
            <Calendar projectId={activeProjectId} />
          )}
          {activeTab === "Files" && activeProjectId && (
            <Files projectId={activeProjectId} />
          )}
          {activeTab === "Settings" && <Settings />}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
