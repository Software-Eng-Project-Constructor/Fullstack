import { FaBars } from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome,
  faTasks,
  faFlag,
  faUsers,
  faCalendar,
  faFolder,
  faCog
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import Logo from './Logo';

interface SidebarProps {
  isOpen: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  toggleSidebar: () => void;
}

function Sidebar({ isOpen, activeTab, onTabChange, toggleSidebar }: SidebarProps) {
  const { theme } = useTheme();

  const getSidebarBgClass = () => {
    if (theme === 'light') {
      return 'bg-gray-100';
    } else {
      return 'bg-[#0B0C0D]';
    }
  };

  const getTextClass = () => {
    return theme === 'light' ? 'text-gray-800' : 'text-gray-300';
  };

  const getHoverClass = () => {
    return theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-[#1C1D1D]';
  };

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
    <div className={`${getSidebarBgClass()} h-screen flex flex-col flex-shrink-0 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${
      isOpen ? "w-64" : "w-16"
    }`}>
      <div className="px-1">
        {isOpen ? (
          <Logo />
        ) : (
          <img src="/assets/logo.png" alt="Logo" className="h-8 w-auto" />
        )}
      </div>

      <button
        onClick={toggleSidebar}
        className={`p-1 hover:bg-[#1C1D1D] rounded-md text-orange-500`}
      >
        <FaBars size={20} />
      </button>

      <div className="flex-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.name === "Overview" ? "/dashboard" : `/dashboard/${item.name.toLowerCase()}`}
            onClick={() => onTabChange(item.name)}
            className={`block w-full px-1 py-2 rounded-md ${
              activeTab === item.name
                ? "bg-orange-600 text-white"
                : `hover:bg-[#1C1D1D] text-orange-500`
            } ${!isOpen ? "text-center" : ""} flex items-center`}
          >
            <FontAwesomeIcon icon={item.icon} className={`${isOpen ? 'mr-2' : 'mx-auto'}`} />
            {isOpen && <span className={getTextClass()}>{item.name}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;