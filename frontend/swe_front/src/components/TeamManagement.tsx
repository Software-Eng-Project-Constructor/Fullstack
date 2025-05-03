import React, { useState, useEffect } from "react";
import { FaUserPlus, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  projectId: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface TeamManagementProps {
  projectId: number;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ projectId }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5001/team?projectId=${projectId}`
        );
        setTeamMembers(response.data);
      } catch (error) {
        console.error("Error fetching team members:", error);
      }
    };

    fetchTeamMembers();
  }, [projectId]);

  const handleSearch = async (query: string) => {
    if (query.length < 2) return [];

    try {
      // Get all users
      const usersResponse = await axios.get("http://localhost:5001/users");
      // Get existing team members
      const teamResponse = await axios.get("http://localhost:5001/team");

      const allUsers = usersResponse.data;
      const existingTeamMembers = teamResponse.data;

      // Filter users who aren't already team members
      return allUsers.filter((user: User) => {
        const isExistingMember = existingTeamMembers.some(
          (member: TeamMember) =>
            member.name === user.name &&
            member.projectId === projectId.toString()
        );

        const matchesSearch =
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase());

        return matchesSearch && !isExistingMember;
      });
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  };

  const handleAddMember = () => {
    let selectedUser: User | null = null;

    Swal.fire({
      title: "Add Team Member",
      html: `
        <div class="flex flex-col gap-4">
          <div class="relative">
            <input 
              id="memberSearch" 
              class="swal2-input" 
              placeholder="Search for team member..."
              autocomplete="off"
            >
            <div id="searchResults" class="absolute w-full mt-1 bg-[#1C1D1D] rounded-md shadow-lg hidden overflow-y-auto max-h-40">
            </div>
          </div>
          <div id="selectedMember" class="hidden">
            <div class="bg-orange-100 text-orange-800 px-3 py-2 rounded-md text-left">
              Selected: <span id="selectedName"></span>
            </div>
          </div>
          <select id="roleSelect" class="swal2-select">
            <option value="">Select Role</option>
            <option value="viewer">Viewer (Read only)</option>
            <option value="contributor">Contributor (Can edit)</option>
            <option value="admin">Admin (Full access)</option>
          </select>
        </div>
      `,
      didOpen: () => {
        const searchInput = document.getElementById(
          "memberSearch"
        ) as HTMLInputElement;
        const searchResultsDiv = document.getElementById("searchResults");
        const selectedMemberDiv = document.getElementById("selectedMember");
        const selectedNameSpan = document.getElementById("selectedName");

        let debounceTimeout: NodeJS.Timeout;
        searchInput.addEventListener("input", (e) => {
          clearTimeout(debounceTimeout);
          const query = (e.target as HTMLInputElement).value;

          debounceTimeout = setTimeout(async () => {
            const results = await handleSearch(query);

            if (searchResultsDiv) {
              searchResultsDiv.innerHTML = results
                .map(
                  (user: { id: any; name: any; email: any }) => `
                <div class="search-result p-2 hover:bg-gray-700 cursor-pointer" data-id="${user.id}">
                  <div class="text-white">${user.name}</div>
                  <div class="text-gray-400 text-sm">${user.email}</div>
                </div>
              `
                )
                .join("");

              if (results.length > 0) {
                searchResultsDiv.classList.remove("hidden");

                // Add click handlers
                const resultElements =
                  searchResultsDiv.querySelectorAll(".search-result");
                resultElements.forEach((el) => {
                  el.addEventListener("click", () => {
                    const userId = el.getAttribute("data-id");
                    selectedUser =
                      results.find(
                        (u: { id: string | null }) => u.id === userId
                      ) || null;
                    if (selectedUser && selectedNameSpan) {
                      selectedNameSpan.textContent = selectedUser.name;
                      selectedMemberDiv?.classList.remove("hidden");
                      searchInput.value = selectedUser.name;
                      searchResultsDiv.classList.add("hidden");
                    }
                  });
                });
              }
            }
          }, 300);
        });
      },
      showCancelButton: true,
      confirmButtonText: "Add Member",
      confirmButtonColor: "#f97316",
      preConfirm: () => {
        if (!selectedUser) {
          Swal.showValidationMessage(
            "Please select a user from the search results"
          );
          return false;
        }

        const role = (
          document.getElementById("roleSelect") as HTMLSelectElement
        ).value;
        if (!role) {
          Swal.showValidationMessage("Please select a role");
          return false;
        }

        return { name: selectedUser.name, role };
      },
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          const response = await axios.post("http://localhost:5001/team", {
            id: Date.now().toString(),
            name: result.value.name,
            role: result.value.role,
            projectId: projectId.toString(),
          });

          setTeamMembers((prev) => [...prev, response.data]);

          Swal.fire({
            title: "Success!",
            text: `${result.value.name} added as ${result.value.role}`,
            icon: "success",
            confirmButtonColor: "#f97316",
          });
        } catch (error) {
          console.error("Error adding team member:", error);
          Swal.fire({
            title: "Error!",
            text: "Failed to add team member",
            icon: "error",
            confirmButtonColor: "#f97316",
          });
        }
      }
    });
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await axios.delete(`http://localhost:5001/team/${memberId}`);
      setTeamMembers((prev) => prev.filter((member) => member.id !== memberId));

      Swal.fire({
        title: "Removed!",
        text: "Team member has been removed",
        icon: "success",
        confirmButtonColor: "#f97316",
      });
    } catch (error) {
      console.error("Error removing team member:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to remove team member",
        icon: "error",
        confirmButtonColor: "#f97316",
      });
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleAddMember}
        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <FaUserPlus /> Add Team Member
      </button>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="bg-[#1C1D1D] p-4 rounded-lg flex justify-between items-center"
          >
            <div>
              <h3 className="text-white font-medium">{member.name}</h3>
              <span className="text-orange-500 text-sm">{member.role}</span>
            </div>
            <button
              onClick={() => handleRemoveMember(member.id)}
              className="text-red-500 hover:text-red-600"
            >
              <FaTimes />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamManagement;
