import { FaBars } from "react-icons/fa";

interface SidebarProps {
  isOpen: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  toggleSidebar: () => void;
}

function Sidebar({ isOpen, activeTab, onTabChange, toggleSidebar }: SidebarProps) {
  return (
    <>
      {/* Static Burger Icon */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 text-white bg-gray-900 p-2 rounded-md shadow-md hover:bg-gray-800"
      >
        <FaBars size={20} />
      </button>

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#0F0F0F] p-4 transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="mt-16 space-y-2">
          {["Overview", "Tasks", "Milestones", "Members", "Calendar", "Files","Settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`block w-full text-left px-4 py-2 rounded-md ${
                activeTab === tab
                  ? "bg-orange-600 text-white"
                  : "text-gray-300 hover:bg-[#1C1D1D]"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;

