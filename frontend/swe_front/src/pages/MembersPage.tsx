import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUserPlus } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

axios.defaults.withCredentials = true;

interface User {
  id: string;
  name: string;
  email: string;
  privilege: string;
  profilePicPath?: string;
}

interface TeamMember {
  id: string;
  role: string;
  user: User;
}

interface MemberPageProps {
  projectId: number;
  user: User | null;
}

const MembersPage: React.FC<MemberPageProps> = ({ projectId, user }) => {
  const { checkSession } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const [role, setRole] = useState("Member");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/projects/${projectId}/members`);
      setMembers(response.data);
    } catch (error) {
      console.error("Error fetching members:", error);
      setError("Failed to fetch project members");
    } finally {
      setIsLoadingMembers(false);
    }
  };

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
      // Check session before making the request
      await checkSession();
      
      const response = await axios.post("http://localhost:5001/api/teams/", payload);
      console.log("User added successfully:", response.data);
      setSuccessMessage("Member added successfully!");
      setInputValue("");
      setRole("Member");
      fetchMembers(); // Refresh the members list
    } catch (error: any) {
      console.error("Error adding user:", error);
      if (error.response?.status === 401) {
        // If unauthorized, try to refresh session and retry
        await checkSession();
        try {
          const retryResponse = await axios.post("http://localhost:5001/api/teams/", payload);
          setSuccessMessage("Member added successfully!");
          setInputValue("");
          setRole("Member");
          fetchMembers();
        } catch (retryError) {
          setError("Failed to add member. Please try again.");
        }
      } else {
        setError("Failed to add member. Please try again.");
      }
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

      {/* Members List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">Current Members</h2>
        {isLoadingMembers ? (
          <div className="flex justify-center items-center h-32">
            <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : members.length === 0 ? (
          <p className="text-gray-400">No members found in this project.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Privilege</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {member.user.profilePicPath ? (
                          <img
                            className="h-8 w-8 rounded-full mr-3"
                            src={member.user.profilePicPath}
                            alt={member.user.name}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-600 mr-3 flex items-center justify-center">
                            <span className="text-white text-sm">
                              {member.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="text-white">{member.user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{member.user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                        member.role === 'Member' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-gray-300">{member.user.privilege}</td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersPage;
