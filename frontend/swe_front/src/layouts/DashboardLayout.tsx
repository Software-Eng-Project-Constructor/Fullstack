import React from 'react';
import Sidebar from '../components/Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("Overview");

  return (

<div className="flex min-h-screen w-full overflow-hidden bg-white dark:bg-[#0B0C0D]">
      <Sidebar
        isOpen={isOpen}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        toggleSidebar={() => setIsOpen(!isOpen)}
      />
      <main className="flex-1 relative">
        <div className="absolute inset-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
