import { useState } from "react";

interface ProjectTabsProps {
  projects: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
}

const ProjectTabs: React.FC<ProjectTabsProps> = ({ projects, onAdd, onRemove }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex bg-gray-800 text-white p-2 shadow-md">
      {projects.map((project, index) => (
        <div
          key={index}
          className={`px-4 py-2 mx-1 rounded-t-md cursor-pointer ${activeIndex === index ? "bg-gray-600" : "bg-gray-700"}`}
          onClick={() => setActiveIndex(index)}
        >
          {project}
          <button onClick={() => onRemove(index)} className="ml-2 text-red-500 hover:text-red-700">✖</button>
        </div>
      ))}
      <button onClick={onAdd} className="px-4 py-2 bg-blue-600 rounded-t-md hover:bg-blue-500">+</button>
    </div>
  );
};

export default ProjectTabs;
