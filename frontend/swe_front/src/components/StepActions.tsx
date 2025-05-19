// components/StepActions.tsx
import { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";

interface StepActionsProps {
  projectId: string;
  stepId: string;
}

interface Action {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface ProjectUser {
  id: string;
  role: string;
  projectId: number;
  user: User;
}

const StepActions: React.FC<StepActionsProps> = ({ projectId, stepId }) => {
  const { theme } = useTheme();
  const [actions, setActions] = useState<Action[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [projectUsers, setProjectUsers] = useState<User[]>([]);
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [editingAction, setEditingAction] = useState<Action | null>(null);

  const [newAction, setNewAction] = useState<Partial<Action>>({
    title: "",
    description: "",
    priority: "medium",
    completed: false,
    assignee: "",
  });

  const fetchActions = async () => {
    try {
      console.log("Fetch Actions Hit!!!");
      const res = await axios.get(`/api/actions/step/${stepId}`);
      const ress: Action[] = [
        {
          id: "123",
          title: "manually loaded title",
          description: "manual description",
          assignee: "test@test.com", // ✅ fixed typo
          priority: "low",
          completed: false, // ✅ should be boolean, not "1"
        },
      ];
      console.log("API has returned into res", res.data);
      const priorityMap = {
        0: "low",
        1: "medium",
        2: "high",
      } as const;

      const mapped = res.data.actions.map((a: any) => ({
        ...a,
        completed: a.status === 2,
        priority: priorityMap[a.priority as 0 | 1 | 2] ?? "low", // fallback to "low"
      }));

      setActions(mapped);
      //setActions(res || []);
    } catch (err) {
      console.error("Failed to fetch actions", err);
    }
  };
  const handleUpdate = async (updated: Action) => {
    try {
      console.log("🧪 PATCH payload:", {
        title: updated.title,
        description: updated.description,
        priority: updated.priority,
        assignee: assignedTo[0] || "",
      });

      const res = await axios.patch(`/api/actions/${updated.id}`, {
        title: updated.title,
        description: updated.description,
        priority: updated.priority,
        assignee: assignedTo[0] || "",
      });

      // Map numeric priority back to readable string
      const priorityMap = {
        0: "low",
        1: "medium",
        2: "high",
      } as const;

      const updatedAction = {
        ...res.data.action,
        completed: res.data.action.status === 2,
        priority: priorityMap[res.data.action.priority as 0 | 1 | 2] ?? "low",
      };

      setActions((prev) =>
        prev.map((a) => (a.id === updatedAction.id ? updatedAction : a))
      );
      setEditingAction(null);
      setAssignedTo([]);
    } catch (err) {
      console.error("Failed to update action", err);
    }
  };

  const fetchProjectUsers = async () => {
    try {
      const res = await axios.get<ProjectUser[]>(`/api/Teams/${projectId}`);
      const users = res.data.map((item) => item.user);
      setProjectUsers(users);
    } catch (err) {
      console.error("Error fetching project users:", err);
    }
  };

  useEffect(() => {
    if (expanded) {
      fetchActions();
      fetchProjectUsers();
    }
  }, [expanded]);

  const toggleAssign = (userId: string) => {
    setAssignedTo((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    try {
      console.log("Post/Create Actions Hit!!!");
      const response = await axios.post("/api/actions", {
        ...newAction,
        assignee: assignedTo[0] || "", // support one assignee for now
        stepId,
      });
      console.log("API Has Returned", response.data.action);

      setActions((prev) => [...prev, response.data.action]);
      setModalOpen(false);
      setNewAction({
        title: "",
        description: "",
        priority: "medium",
      });
      setAssignedTo([]);
    } catch (err: any) {
      console.error("Failed to create action", err);
      if (err.response) {
        console.error(
          "Server responded with:",
          err.response.status,
          err.response.data
        );
      } else if (err.request) {
        console.error("No response received:", err.request);
      } else {
        console.error("Error during setup:", err.message);
      }
    }
  };

  const toggleCompletion = async (id: string) => {
    const action = actions.find((a) => a.id === id);
    if (!action) return;

    const newCompleted = !action.completed;

    try {
      const res = await axios.patch(`/api/actions/${id}`, {
        completed: newCompleted,
      });

      // Safely use backend response for status
      const updatedStatus = res.data.action.status;

      setActions((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, completed: updatedStatus === 2 } : a
        )
      );
    } catch (err) {
      console.error("Failed to toggle completion", err);
    }
  };

  const deleteAction = async (id: string) => {
    try {
      await axios.delete(`/api/actions/${id}`);
      setActions((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to delete action", err);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="text-sm text-orange-500 underline mt-2 mb-3"
      >
        {expanded ? "Hide Actions" : "View Actions"}
      </button>
      {expanded && (
        <div className="space-y-3">
          <button
            onClick={() => setModalOpen(true)}
            className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded"
          >
            <FaPlus className="inline mr-1" /> New Action
          </button>
          {actions.map((a) => (
            <div
              key={a.id}
              className="border border-gray-300 dark:border-gray-700 p-3 rounded-md flex items-start justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={a.completed}
                    onChange={() => {
                      console.log("Checkbox toggled", a.id);
                      toggleCompletion(a.id);
                    }}
                    className="accent-orange-500"
                  />
                  <span
                    className={
                      a.completed ? "line-through text-gray-400" : "font-medium"
                    }
                  >
                    {a.title}
                  </span>
                </div>
                {a.description && (
                  <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
                    {a.description}
                  </p>
                )}
                <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                  Assigned to:{" "}
                  <span className="text-orange-500">{a.assignee}</span> —
                  Priority: {a.priority}
                </p>
              </div>
              <div className=" text-sm flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingAction(a);
                    setAssignedTo([a.assignee]); // prefill assigned user
                  }}
                  className="text-blue-500 hover:text-blue-600  transition-colors"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => deleteAction(a.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1C1D1D] p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4 text-orange-500">
              Create Action
            </h3>
            <input
              type="text"
              placeholder="Title"
              value={typeof newAction.title === "string" ? newAction.title : ""}
              onChange={(e) =>
                setNewAction((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full mb-3 p-2 border border-gray-300 dark:border-gray-600 rounded"
            />
            <textarea
              placeholder="Description (optional)"
              value={newAction.description ?? ""}
              onChange={(e) =>
                setNewAction((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full mb-3 p-2 border border-gray-300 dark:border-gray-600 rounded"
              rows={2}
            />

            {/* Assigned To: checkbox list */}
            <div className="mb-4">
              <p className="mb-2">Assigned To:</p>
              <div className="max-h-40 overflow-auto bg-[#0F0F0F] p-2 rounded text-white">
                {projectUsers.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center mb-1 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={assignedTo.includes(u.id)}
                      onChange={() => toggleAssign(u.id)}
                    />
                    {u.name}
                  </label>
                ))}
                {projectUsers.length === 0 && (
                  <p className="text-gray-500">No users in this project</p>
                )}
              </div>
            </div>

            <select
              value={newAction.priority || "medium"}
              onChange={(e) =>
                setNewAction((prev) => ({
                  ...prev,
                  priority: e.target.value as Action["priority"],
                }))
              }
              className="w-full mb-4 p-2 border border-gray-300 dark:border-gray-600 rounded"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setAssignedTo([]);
                }}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      {editingAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1C1D1D] p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4 text-orange-500">
              Edit Action
            </h3>
            <input
              type="text"
              placeholder="Title"
              value={editingAction.title}
              onChange={(e) =>
                setEditingAction(
                  (prev) => prev && { ...prev, title: e.target.value }
                )
              }
              className="w-full mb-3 p-2 border border-gray-300 dark:border-gray-600 rounded"
            />
            <textarea
              placeholder="Description"
              value={editingAction.description || ""}
              onChange={(e) =>
                setEditingAction(
                  (prev) => prev && { ...prev, description: e.target.value }
                )
              }
              className="w-full mb-3 p-2 border border-gray-300 dark:border-gray-600 rounded"
              rows={2}
            />
            <div className="mb-4">
              <p className="mb-2">Assigned To:</p>
              <div className="max-h-40 overflow-auto bg-[#0F0F0F] p-2 rounded text-white">
                {projectUsers.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center mb-1 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={assignedTo.includes(u.id)}
                      onChange={() => toggleAssign(u.id)}
                    />
                    {u.name}
                  </label>
                ))}
              </div>
            </div>
            <select
              value={editingAction.priority}
              onChange={(e) =>
                setEditingAction(
                  (prev) =>
                    prev && {
                      ...prev,
                      priority: e.target.value as Action["priority"],
                    }
                )
              }
              className="w-full mb-4 p-2 border border-gray-300 dark:border-gray-600 rounded"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingAction(null)}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdate(editingAction)}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepActions;
