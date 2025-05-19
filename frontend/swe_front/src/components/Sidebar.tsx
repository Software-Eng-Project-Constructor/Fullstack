import { FaBars } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faTasks,
  faFlag,
  faUsers,
  faCalendar,
  faFolder,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import Logo from "./Logo";

interface SidebarProps {
  isOpen: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  toggleSidebar: () => void;
}

function Sidebar({
  isOpen,
  activeTab,
  onTabChange,
  toggleSidebar,
}: SidebarProps) {
  const { theme } = useTheme();

  const bgClass = theme === "light" ? "bg-white" : "bg-[#0B0C0D]";
  const textClass = theme === "light" ? "text-gray-800" : "text-gray-300";
  const borderColor = theme === "light" ? "border-gray-200" : "border-gray-800";

  const navItems = [
    { name: "Overview", icon: faHome },
    { name: "Tasks", icon: faTasks },
    { name: "Milestones", icon: faFlag },
    { name: "Members", icon: faUsers },
    { name: "Calendar", icon: faCalendar },
    { name: "Files", icon: faFolder },
    { name: "Settings", icon: faCog },
  ];

  return (
    <div
      className={`h-screen flex flex-col ${bgClass} ${borderColor} border-r transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Logo + Toggle Section */}
      <div
        className={`h-20 px-4 pt-6 shrink-0 flex ${isOpen ? "justify-between items-center" : "justify-center"}`}
      >
        {isOpen && <Logo />}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-orange-100 dark:hover:bg-[#1C1D1D] text-orange-500"
        >
          <FaBars size={18} />
        </button>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-2 mt-8 space-y-4 overflow-y-auto pb-6">
        {navItems.map((item) => {
          const isActive = activeTab === item.name;
          return (
            <Link
              key={item.name}
              to={
                item.name === "Overview"
                  ? "/dashboard"
                  : `/dashboard/${item.name.toLowerCase()}`
              }
              onClick={() => onTabChange(item.name)}
              className={`flex items-center px-3 py-3 rounded-md transition-colors duration-200 ${
                isActive
                  ? "bg-orange-600 text-white"
                  : "text-orange-500 hover:bg-orange-100 dark:hover:bg-[#1C1D1D]"
              } ${!isOpen ? "justify-center" : "gap-3"}`}
            >
              <FontAwesomeIcon icon={item.icon} size="sm" />
              {isOpen && (
                <span className={`text-sm ${textClass}`}>{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default Sidebar;
