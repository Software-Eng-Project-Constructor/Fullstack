import React, { useState } from "react";
import axios from "axios";
import { FaUserPlus } from "react-icons/fa";

axios.defaults.withCredentials = true;

interface User {
  id: string;
  name: string;
  email: string;
}

interface MemberPageProps {
  projectId: number;
  user: User | null;
}

const MembersPage: React.FC<MemberPageProps> = ({ projectId, user }) => {
  const [inputValue, setInputValue] = useState("");
  const [role, setRole] = useState("Member");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!inputValue.trim()) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const payload = {
      projectId: projectId,
      email: inputValue,
      role: role,
    };

    try {
      const response = await axios.post("http://localhost:5001/api/teams/", payload);
      console.log("User added successfully:", response.data);
      setSuccessMessage("Member added successfully!");
      setInputValue("");
      setRole("Member");
    } catch (error) {
      console.error("Error adding user:", error);
      setError("Failed to add member. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-900 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-white mb-6">Project Members</h1>

      <div className="mb-6">
        <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
          Add new member
        </label>
        <div className="flex mb-2">
          <input
            type="email"
            id="email"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter member's email..."
            className="flex-grow bg-gray-800 text-white px-4 py-2 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 border-l border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Admin">Admin</option>
            <option value="Member">Member</option>
            <option value="Viewer">Viewer</option>
          </select>
          <button
            className={`bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleAdd}
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <FaUserPlus className="mr-2" />
            )}
            {isLoading ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
          <p>{successMessage}</p>
        </div>
      )}
    </div>
  );
};

export default MembersPage;
