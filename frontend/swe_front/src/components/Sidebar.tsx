import { FaBars } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext"; // Import ThemeContext
import { Link } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  toggleSidebar: () => void;
}

function Sidebar({ isOpen, activeTab, onTabChange, toggleSidebar }: SidebarProps) {
  const { theme } = useTheme(); // Use theme context

  // Get theme-specific classes
  const getSidebarBgClass = () => {
    if (theme === 'light') {
      return 'bg-gray-100';
    } else {
      return 'bg-[#0B0C0D]'; // Dark sidebar
    }
  };

  const getTextClass = () => {
    return theme === 'light' ? 'text-gray-800' : 'text-gray-300';
  };

  const getHoverClass = () => {
    return theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-[#1C1D1D]';
  };

  return (
    <div
      className={`${getSidebarBgClass()} h-screen fixed left-0 transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      } py-4 flex flex-col`}
      style={{ zIndex: 10 }}
    >
      {/* Burger Icon */}
      <button
        onClick={toggleSidebar}
        className={`p-4 hover:bg-[#1C1D1D] rounded-md m-2 ${getTextClass()}`}
      >
        <FaBars size={20} />
      </button>

      {/* Navigation Links */}
      <div className="mt-8 flex-1">
        {["Overview", "Tasks", "Milestones", "Members", "Calendar", "Files", "Settings"].map(
          (tab) => (
            <Link
              key={tab}
              to={tab === "Overview" ? "/dashboard" : `/dashboard/${tab.toLowerCase()}`}
              onClick={() => onTabChange(tab)}
              className={`block w-full text-left px-4 py-2 rounded-md ${
                activeTab === tab
                  ? "bg-orange-600 text-white"
                  : `${getTextClass()} ${getHoverClass()}`
              } ${!isOpen ? "text-center" : ""}`}
            >
              {isOpen ? tab : tab.charAt(0)}
            </Link>
          )
        )}
      </div>
    </div>
  );
}

export default Sidebar;