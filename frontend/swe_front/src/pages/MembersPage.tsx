import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUserPlus, FaTimes } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext"; // Import ThemeContext
import Swal from 'sweetalert2';

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

const MembersPage: React.FC<MemberPageProps> = ({ projectId }) => {
  const { checkSession } = useAuth();
  const { theme } = useTheme(); // Use theme context
  const [inputValue, setInputValue] = useState("");
  const [role, setRole] = useState("Member");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  // Define theme-specific styles
  const getThemeStyles = () => {
    if (theme === 'light') {
      return {
        // Main container
        containerBg: 'bg-white',
        containerShadow: 'shadow-md',
        
        // Headers and text
        headerText: 'text-gray-800',
        normalText: 'text-gray-600',
        mutedText: 'text-gray-500',
        
        // Inputs and selects
        inputBg: 'bg-gray-100',
        inputText: 'text-gray-800',
        inputBorder: 'border-gray-300',
        inputFocus: 'focus:ring-blue-500',
        
        // Tables
        tableBg: 'bg-white',
        tableHeaderBg: 'bg-gray-200',
        tableHeaderText: 'text-gray-700',
        tableDivider: 'divide-gray-200',
        tableHover: 'hover:bg-gray-100',
        
        // Alerts
        errorBg: 'bg-red-100',
        successBg: 'bg-green-100',
        
        // Avatar placeholder
        avatarBg: 'bg-gray-300',
      };
    } else {
      return {
        // Main container
        containerBg: 'bg-gray-900',
        containerShadow: 'shadow-lg',
        
        // Headers and text
        headerText: 'text-white',
        normalText: 'text-white',
        mutedText: 'text-gray-400',
        
        // Inputs and selects
        inputBg: 'bg-gray-800',
        inputText: 'text-white',
        inputBorder: 'border-gray-700',
        inputFocus: 'focus:ring-blue-500',
        
        // Tables
        tableBg: 'bg-gray-800',
        tableHeaderBg: 'bg-gray-700',
        tableHeaderText: 'text-gray-300',
        tableDivider: 'divide-gray-700',
        tableHover: 'hover:bg-gray-700',
        
        // Alerts
        errorBg: 'bg-red-100', // Keeping alert colors consistent for better visibility
        successBg: 'bg-green-100',
        
        // Avatar placeholder
        avatarBg: 'bg-gray-600',
      };
    }
  };

  const styles = getThemeStyles();

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
      await checkSession();
      
      const response = await axios.post("http://localhost:5001/api/teams/", payload);
      console.log("User added successfully:", response.data);
      setInputValue("");
      setRole("Member");
      fetchMembers();

      // Show success notification
      Swal.fire({
        title: 'Success!',
        text: 'Team member has been added successfully',
        icon: 'success',
        confirmButtonColor: '#f97316',
      });
    } catch (error: any) {
      console.error("Error adding user:", error);
      if (error.response?.status === 401) {
        await checkSession();
        try {
          await axios.post("http://localhost:5001/api/teams/", payload);
          setInputValue("");
          setRole("Member");
          fetchMembers();
          
          Swal.fire({
            title: 'Success!',
            text: 'Team member has been added successfully',
            icon: 'success',
            confirmButtonColor: '#f97316',
          });
        } catch (retryError) {
          Swal.fire({
            title: 'Error!',
            text: 'Failed to add team member',
            icon: 'error',
            confirmButtonColor: '#f97316',
          });
        }
      } else {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to add team member',
          icon: 'error',
          confirmButtonColor: '#f97316',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    // Add confirmation dialog
    const result = await Swal.fire({
      title: 'Remove Team Member',
      text: 'Are you sure you want to remove this team member?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove them!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5001/api/teams/${memberId}`);
        fetchMembers();
        
        // Show success notification
        Swal.fire({
          title: 'Removed!',
          text: 'Team member has been removed successfully',
          icon: 'success',
          confirmButtonColor: '#f97316',
        });
      } catch (error) {
        console.error("Error removing team member:", error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to remove team member',
          icon: 'error',
          confirmButtonColor: '#f97316',
        });
      }
    }
  };

  return (
    <div className={`p-8 ${styles.containerBg} rounded-lg ${styles.containerShadow}`}>
      <h1 className={`text-3xl font-bold ${styles.headerText} mb-6`}>Project Members</h1>

      <div className="mb-6">
        <label htmlFor="email" className={`block text-sm font-medium ${styles.mutedText} mb-2`}>
          Add new member
        </label>
        <div className="flex mb-2">
          <input
            type="email"
            id="email"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter member's email..."
            className={`flex-grow ${styles.inputBg} ${styles.inputText} px-4 py-2 rounded-l focus:outline-none focus:ring-2 ${styles.inputFocus}`}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={`${styles.inputBg} ${styles.inputText} px-4 py-2 border-l ${styles.inputBorder} focus:outline-none focus:ring-2 ${styles.inputFocus}`}
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
        <h2 className={`text-xl font-semibold ${styles.headerText} mb-4`}>Current Members</h2>
        {isLoadingMembers ? (
          <div className="flex justify-center items-center h-32">
            <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : members.length === 0 ? (
          <p className={styles.mutedText}>No members found in this project.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={`min-w-full ${styles.tableBg} rounded-lg overflow-hidden`}>
              <thead className={styles.tableHeaderBg}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${styles.tableHeaderText} uppercase tracking-wider`}>Name</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${styles.tableHeaderText} uppercase tracking-wider`}>Email</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${styles.tableHeaderText} uppercase tracking-wider`}>Role</th>
                </tr>
              </thead>
              <tbody className={`${styles.tableDivider}`}>
                {members.map((member) => (
                  <tr key={member.id} className={styles.tableHover}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {member.user.profilePicPath ? (
                          <img
                            className="h-8 w-8 rounded-full mr-3"
                            src={member.user.profilePicPath}
                            alt={member.user.name}
                          />
                        ) : (
                          <div className={`h-8 w-8 rounded-full ${styles.avatarBg} mr-3 flex items-center justify-center`}>
                            <span className="text-white text-sm">
                              {member.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className={styles.normalText}>{member.user.name}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${styles.mutedText}`}>{member.user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          member.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                          member.role === 'Member' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {member.role}
                        </span>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-500 hover:text-red-600 ml-4"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </td>
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