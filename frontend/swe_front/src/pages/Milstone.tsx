import { useEffect, useState } from "react";
import { FaListCheck, FaCalendar, FaPlus } from "react-icons/fa6"; // Keep these from fa6 if they are there
import { FaEdit, FaTrash } from "react-icons/fa"; // Import FaEdit and FaTrash from 'react-icons/fa'
import axios from "axios";
import ProgressBar from "../components/progressbar";
import Swal from "sweetalert2";
import { useTheme } from "../context/ThemeContext"; // Import ThemeContext
import StepActions from "../components/StepActions"; // Adjust the path if necessary

axios.defaults.withCredentials = true;

// Add axios interceptor to handle 401 errors globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Swal.fire({
        title: "Session Expired",
        text: "Your session has expired. Please log in again.",
        icon: "warning",
        confirmButtonColor: "#f97316",
      }).then(() => {
        window.location.href = "/signin";
      });
    }
    return Promise.reject(error);
  }
);
interface Action {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  assignee: string;
}

// Updated Task interface to match the 'Step' structure from the new API
// Removed 'assignedTo'
interface Task {
  id: number; // Assuming step id is number based on the example endpoint
  title: string;
  description: string;
  status: number; // 0 = pending, 1 = in progress, 2 = finished
  startDate?: string; // Changed from startsDate to startDate
  dueDate?: string; // Optional based on API structure
  milestoneId: string; // Link to the parent milestone
}

interface Milestone {
  id: string;
  projectId: number;
  title: string;
  description: string;
  dueDate: string;
  status: "Not Started" | "In Progress" | "Completed"; // Milestone status remains the same
  tasks: Task[]; // This will now hold 'Step' objects
}

interface ProjectMilestonesProps {
  projectId: string;
  stepId: string;
}

// Define status mapping for clarity
const TASK_STATUS = {
  PENDING: 0,
  IN_PROGRESS: 1,
  FINISHED: 2,
};

const ProjectMilestones: React.FC<ProjectMilestonesProps> = ({
  projectId,
  stepId,
}) => {
  const { theme } = useTheme(); // Use theme context
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false); // Renamed for clarity
  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({
    title: "",
    description: "",
    dueDate: "",
    status: "Not Started",
    tasks: [], // Initialize as empty
  });
  const [showAddTaskModal, setShowAddTaskModal] = useState<string | null>(null);
  // Initialize newTask with the numerical status and date fields, removed assignedTo
  const [newTask, setNewTask] = useState<Omit<Task, "id" | "milestoneId">>({
    title: "",
    description: "",
    status: TASK_STATUS.PENDING, // Default status is pending (0)
    startDate: "", // Changed from startsDate to startDate
    dueDate: "", // Initialize dueDate
  });

  // State for editing tasks
  const [showEditTaskModal, setShowEditTaskModal] = useState<Task | null>(null);
  const [editedTask, setEditedTask] = useState<Partial<Task> | null>(null);

  // Removed contributors state as it's no longer used for task assignment
  // const [contributors, setContributors] = useState<any[]>([]);

  // Define theme-specific styles
  const getThemeStyles = () => {
    if (theme === "light") {
      return {
        // Main container
        mainBg: "bg-white",
        containerShadow: "shadow-md",
        headerText: "text-gray-800",
        subheaderText: "text-gray-600",
        normalText: "text-gray-700",
        mutedText: "text-gray-500",

        // Card styles
        cardBg: "bg-gray-50",
        cardInnerBg: "bg-white",
        cardInnerBgAlt: "bg-gray-100",
        cardShadow: "shadow-sm",
        cardBorder: "border border-gray-200",

        // Form elements
        inputBg: "bg-white",
        inputBorder: "border-gray-300",
        inputText: "text-gray-800",

        // Buttons
        buttonSecondary: "bg-gray-300 hover:bg-gray-400",
        buttonSecondaryText: "text-gray-800",

        // Task checkboxes (will need adjustment for status number)
        checkboxBg: "bg-white",
        checkboxBorder: "border-gray-400",

        // Modal
        modalBg: "bg-white",
        modalOverlay: "bg-black bg-opacity-50",
      };
    } else {
      return {
        // Main container
        mainBg: "bg-[#0F0F0F]",
        containerShadow: "shadow-lg",
        headerText: "text-orange-500",
        subheaderText: "text-gray-400",
        normalText: "text-gray-200",
        mutedText: "text-gray-400",

        // Card styles
        cardBg: "bg-[#1C1D1D]",
        cardInnerBg: "bg-[#0F0F0F]",
        cardInnerBgAlt: "bg-[#1C1D1D]",
        cardShadow: "shadow-md",
        cardBorder: "border border-gray-800",

        // Form elements
        inputBg: "bg-[#0F0F0F]",
        inputBorder: "border-gray-700",
        inputText: "text-white",

        // Buttons
        buttonSecondary: "bg-gray-600 hover:bg-gray-700",
        buttonSecondaryText: "text-white",

        // Task checkboxes (will need adjustment for status number)
        checkboxBg: "bg-gray-800",
        checkboxBorder: "border-gray-600",

        // Modal
        modalBg: "bg-[#1C1D1D]",
        modalOverlay: "bg-black bg-opacity-50",
      };
    }
  };

  const styles = getThemeStyles();

  // Removed fetchContributors effect as it's no longer needed for task assignment
  // useEffect(() => {
  //   const fetchContributors = async () => {
  //     const data = await getContributors();
  //     setContributors(data);
  //   };
  //   fetchContributors();
  // }, [projectId]);

  useEffect(() => {
    // Reset new milestone state when project ID changes
    setNewMilestone({
      title: "",
      description: "",
      dueDate: "",
      status: "Not Started",
      tasks: [],
    });
  }, [projectId]);

  // Calculate milestone progress based on step status (2 = finished)
  const calculateMilestoneProgress = (tasks: Task[]) => {
    if (!tasks?.length) return 0;
    const completedTasks = tasks.filter(
      (task) => task.status === TASK_STATUS.FINISHED
    ).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  // Calculate overall progress based on all steps status (2 = finished)
  const calculateOverallProgress = () => {
    if (!milestones.length) return 0;
    const allTasks = milestones.flatMap((m) => m.tasks || []);
    if (allTasks.length === 0) return 0;
    const completedTasks = allTasks.filter(
      (task) => task.status === TASK_STATUS.FINISHED
    ).length;
    return Math.round((completedTasks / allTasks.length) * 100);
  };

  // Update milestone status based on its steps' progress
  const updateMilestoneStatus = async (milestoneId: string) => {
    const milestone = milestones.find((m) => m.id === milestoneId);
    if (!milestone) return;

    const progress = calculateMilestoneProgress(milestone.tasks);
    let newStatus: Milestone["status"] = "Not Started";

    if (progress === 100) {
      newStatus = "Completed";
    } else if (progress > 0) {
      newStatus = "In Progress";
    }

    // Only update milestone status if it actually changes
    if (milestone.status !== newStatus) {
      try {
        await axios.patch(`/api/milestones/${milestoneId}`, {
          status: newStatus,
          // We don't send tasks back with the milestone update now
        });

        setMilestones((prev) =>
          prev.map((m) =>
            m.id === milestoneId ? { ...m, status: newStatus } : m
          )
        );
      } catch (error) {
        console.error("Error updating milestone status:", error);
      }
    }
  };

  // Fetch milestones and their associated steps on component mount and projectId change
  useEffect(() => {
    const fetchMilestonesAndSteps = async () => {
      setLoading(true);
      try {
        const milestonesResponse = await axios.get(
          `/api/milestones?projectId=${projectId}`
        );
        console.log("Fetched milestones:", milestonesResponse.data);

        // For each milestone, fetch its steps using the new API endpoint
        const milestonesWithSteps = await Promise.all(
          milestonesResponse.data.map(async (milestone: Milestone) => {
            try {
              const stepsResponse = await axios.get(
                `/api/steps/milestone/${milestone.id}`
              );
              console.log(
                `Fetched steps for milestone ${milestone.id}:`,
                stepsResponse.data
              );
              return { ...milestone, tasks: stepsResponse.data || [] }; // Assign steps to tasks property
            } catch (stepError) {
              console.error(
                `Error fetching steps for milestone ${milestone.id}:`,
                stepError
              );
              return { ...milestone, tasks: [] }; // Return milestone with empty tasks if fetching steps fails
            }
          })
        );

        setMilestones(milestonesWithSteps);
      } catch (error) {
        console.error("Error fetching milestones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMilestonesAndSteps();
  }, [projectId]); // Depend on projectId to refetch when it changes

  const handleAddMilestone = async () => {
    try {
      const milestone = {
        ...newMilestone,
        projectId: parseInt(projectId), // Convert string projectId to number
        dueDate: new Date(newMilestone.dueDate!).toISOString(),
        tasks: [], // Tasks are managed separately now
      };

      // Post the new milestone
      const response = await axios.post("/api/milestones", milestone);
      const createdMilestone = response.data;

      // Add the created milestone with an empty tasks array to the state
      setMilestones((prev) => [...prev, { ...createdMilestone, tasks: [] }]);

      // Add event for the milestone

      // Close modal and reset form
      setShowAddMilestoneModal(false); // Use renamed state
      setNewMilestone({
        title: "",
        description: "",
        dueDate: "",
        status: "Not Started",
        tasks: [],
      });

      Swal.fire({
        title: "Success!",
        text: "Milestone has been created successfully",
        icon: "success",
        confirmButtonColor: "#f97316",
      });
    } catch (error) {
      console.error("Error adding milestone:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to create milestone",
        icon: "error",
        confirmButtonColor: "#f97316",
      });
    }
  };

  // Removed getContributors function as it's no longer used

  // Handle adding a new task (step) to a milestone using the new API
  const handleAddTask = async (milestoneId: string) => {
    try {
      const milestone = milestones.find((m) => m.id === milestoneId);
      if (!milestone) {
        console.error("Milestone not found");
        return;
      }

      // Convert date strings to ISO-8601 format before sending
      const formattedStartDate = newTask.startDate
        ? new Date(newTask.startDate).toISOString()
        : undefined;
      const formattedDueDate = newTask.dueDate
        ? new Date(newTask.dueDate).toISOString()
        : undefined;

      // Prepare the new step data according to the API structure
      // Removed assignedTo from the data sent
      const newStepData = {
        title: newTask.title,
        description: newTask.description,
        status: TASK_STATUS.PENDING, // New tasks start as pending (0)
        startDate: formattedStartDate, // Use the formatted date
        dueDate: formattedDueDate, // Use the formatted date
        milestoneId: milestoneId, // Link the step to the milestone
      };

      // Post the new step to the API
      const response = await axios.post("/api/steps", newStepData);
      const createdStep = response.data;

      // Update the state by adding the new step to the correct milestone's tasks array
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === milestoneId
            ? { ...m, tasks: [...(m.tasks || []), createdStep] }
            : m
        )
      );

      // Update the milestone status based on the new task list
      updateMilestoneStatus(milestoneId);

      // Close modal and reset form
      setShowAddTaskModal(null); // Use renamed state
      // Reset newTask state, removed assignedTo
      setNewTask({
        title: "",
        description: "",
        status: TASK_STATUS.PENDING,
        startDate: "", // Changed from startsDate to startDate
        dueDate: "",
      });

      Swal.fire({
        title: "Success!",
        text: "Task added successfully",
        icon: "success",
        confirmButtonColor: "#f97316",
      });
    } catch (error) {
      console.error("Error adding task:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to add Step",
        icon: "error",
        confirmButtonColor: "#f97316",
      });
    }
  };

  // Handle deleting a milestone and its associated steps
  const handleDeleteMilestone = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Milestone",
      text: "Are you sure you want to delete this milestone and all its tasks?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        // Assuming backend handles cascading delete of steps when milestone is deleted.
        // If not, you would need to fetch all steps for this milestone
        // and delete them individually using DELETE /api/steps/[stepId]

        // Delete associated events first
        // Then delete the milestone
        await axios.delete(`/api/milestones/${id}`);

        // Remove the milestone from the state
        setMilestones((prev) => prev.filter((m) => m.id !== id));

        Swal.fire({
          title: "Deleted!",
          text: "Milestone and its tasks have been deleted.",
          icon: "success",
          confirmButtonColor: "#f97316",
        });
      } catch (error) {
        console.error("Error deleting milestone:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete the milestone.",
          icon: "error",
          confirmButtonColor: "#f97316",
        });
      }
    }
  };

  // Handle toggling a task (step) status using the new API
  // This is for the checkbox, toggling between pending and finished
  const handleToggleTask = async (milestoneId: string, taskId: number) => {
    try {
      const milestone = milestones.find((m) => m.id === milestoneId);
      if (!milestone) return;

      const taskToToggle = milestone.tasks.find((task) => task.id === taskId);
      if (!taskToToggle) return;

      // Determine the new status (toggle between pending and finished)
      const newStatus =
        taskToToggle.status === TASK_STATUS.FINISHED
          ? TASK_STATUS.PENDING
          : TASK_STATUS.FINISHED;

      // Prepare the update data for the step - only sending status
      const updateData = {
        status: newStatus,
      };

      // Send the update to the API using PUT /api/steps/[stepId]
      await axios.put(`/api/steps/${milestoneId}/${taskId}`, updateData);

      // Update the state with the new task status
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === milestoneId
            ? {
                ...m,
                tasks: m.tasks.map((task) =>
                  task.id === taskId ? { ...task, status: newStatus } : task
                ),
              }
            : m
        )
      );

      // Update the milestone status based on the new task list
      updateMilestoneStatus(milestoneId);
    } catch (error) {
      console.error("Error updating task status:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to update task status.",
        icon: "error",
        confirmButtonColor: "#f97316",
      });
    }
  };

  // Handle updating a task (step) with all fields
  const handleUpdateTask = async () => {
    if (!editedTask || editedTask.id === undefined || !editedTask.milestoneId) {
      console.error("Edited task data is incomplete.");
      return;
    }

    try {
      // Convert date strings to ISO-8601 format before sending
      const formattedStartDate = editedTask.startDate
        ? new Date(editedTask.startDate).toISOString()
        : undefined;
      const formattedDueDate = editedTask.dueDate
        ? new Date(editedTask.dueDate).toISOString()
        : undefined;

      // Prepare the update data according to the API schema
      const updateData = {
        title: editedTask.title,
        description: editedTask.description,
        status: editedTask.status,
        startDate: formattedStartDate,
        dueDate: formattedDueDate,
        // Assuming milestoneId is not typically updated via PUT on a step
        // milestoneId is not typically updated via PUT on a step
      };

      // Send the update to the API using PUT /api/steps/[stepId]
      const response = await axios.put(
        `/api/steps/${editedTask.milestoneId}/${editedTask.id}`,
        updateData
      );
      const updatedStep = response.data;

      // Update the state with the updated task
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === editedTask.milestoneId
            ? {
                ...m,
                tasks: m.tasks.map((task) =>
                  task.id === updatedStep.id ? updatedStep : task
                ),
              }
            : m
        )
      );

      // Update the milestone status based on the new task list
      updateMilestoneStatus(editedTask.milestoneId);

      // Close modal and reset state
      setShowEditTaskModal(null);
      setEditedTask(null);

      Swal.fire({
        title: "Success!",
        text: "Task updated successfully",
        icon: "success",
        confirmButtonColor: "#f97316",
      });
    } catch (error) {
      console.error("Error updating task:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to update task.",
        icon: "error",
        confirmButtonColor: "#f97316",
      });
    }
  };

  // Handle deleting a task (step)
  const handleDeleteTask = async (milestoneId: string, taskId: number) => {
    const result = await Swal.fire({
      title: "Delete Task",
      text: "Are you sure you want to delete this task?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        // Send the delete request to the API
        await axios.delete(`/api/steps/${milestoneId}/${taskId}`);

        // Remove the task from the state
        setMilestones((prev) =>
          prev.map((m) =>
            m.id === milestoneId
              ? {
                  ...m,
                  tasks: m.tasks.filter((task) => task.id !== taskId),
                }
              : m
          )
        );

        // Update the milestone status based on the new task list
        updateMilestoneStatus(milestoneId);

        Swal.fire({
          title: "Deleted!",
          text: "Task has been deleted.",
          icon: "success",
          confirmButtonColor: "#f97316",
        });
      } catch (error) {
        console.error("Error deleting task:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete the task.",
          icon: "error",
          confirmButtonColor: "#f97316",
        });
      }
    }
  };

  // Helper to get status text from number
  const getStatusText = (status: number) => {
    switch (status) {
      case TASK_STATUS.PENDING:
        return "Pending";
      case TASK_STATUS.IN_PROGRESS:
        return "In Progress";
      case TASK_STATUS.FINISHED:
        return "Finished";
      default:
        return "Unknown";
    }
  };

  // Helper to format date string for date input (YYYY-MM-DD)
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-orange-500 text-xl">
          <div className="animate-spin mr-2 inline-block">⌛</div>
          Loading milestones...
        </div>
      </div>
    );
  }

  const overallProgress = calculateOverallProgress();

  return (
    <div
      className={`max-w-6xl mx-auto p-8 ${styles.mainBg} rounded-lg ${styles.containerShadow} ${styles.normalText}`}
    >
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className={`text-3xl font-bold ${styles.headerText}`}>
              Project Milestones
            </h1>
            <p className={styles.subheaderText}>Project ID: {projectId}</p>
          </div>
          <button
            onClick={() => setShowAddMilestoneModal(true)} // Use renamed state
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaPlus /> Add Milestone
          </button>
        </div>

        <div
          className={`${styles.cardBg} p-4 rounded-lg mb-6 ${styles.cardShadow}`}
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className={`text-lg font-semibold ${styles.headerText}`}>
              Overall Progress
            </h2>
            <span className={styles.mutedText}>{overallProgress}%</span>
          </div>
          <ProgressBar progress={overallProgress} />
        </div>
      </div>

      <div className="space-y-6">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className={`${styles.cardBg} p-6 rounded-lg ${styles.cardShadow}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className={`text-xl font-bold ${styles.headerText}`}>
                  {milestone.title}
                </h2>
                <p className={styles.mutedText + " mt-2"}>
                  {milestone.description}
                </p>
                <div
                  className={`flex items-center mt-2 text-sm ${styles.mutedText}`}
                >
                  <FaCalendar className="mr-2" />
                  Due: {new Date(milestone.dueDate).toLocaleDateString()}
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm ${styles.mutedText}`}>
                      Progress
                    </span>
                    <span className={`text-sm ${styles.mutedText}`}>
                      {calculateMilestoneProgress(milestone.tasks)}%
                    </span>
                  </div>
                  <ProgressBar
                    progress={calculateMilestoneProgress(milestone.tasks)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 ml-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    milestone.status === "Completed"
                      ? "bg-green-600 text-green-100"
                      : milestone.status === "In Progress"
                        ? "bg-yellow-600 text-yellow-100"
                        : "bg-gray-600 text-gray-100"
                  }`}
                >
                  {milestone.status}
                </span>
                <button
                  onClick={() => handleDeleteMilestone(milestone.id)}
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3
                  className={`text-lg font-semibold flex items-center ${styles.normalText}`}
                >
                  <FaListCheck className="mr-2 text-orange-500" />
                  Steps ({milestone.tasks?.length || 0})
                </h3>
                <button
                  onClick={() => setShowAddTaskModal(milestone.id)} // Use renamed state
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-sm flex items-center"
                >
                  <FaPlus className="mr-1" /> Add Steps
                </button>
              </div>

              {milestone.tasks && milestone.tasks.length > 0 && (
                <div className="space-y-3">
                  {milestone.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`${styles.cardInnerBg} p-4 rounded-lg ${styles.cardBorder}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {/* Checkbox reflects status 2 (finished) */}
                          <input
                            type="checkbox"
                            checked={task.status === TASK_STATUS.FINISHED}
                            onChange={() =>
                              handleToggleTask(milestone.id, task.id)
                            }
                            className={`w-4 h-4 text-orange-500 ${styles.checkboxBg} rounded ${styles.checkboxBorder} focus:ring-orange-500`}
                          />
                          <span
                            className={`ml-3 ${
                              task.status === TASK_STATUS.FINISHED
                                ? "line-through " + styles.mutedText
                                : styles.normalText
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>

                        <div
                          className={`text-sm ${styles.mutedText} flex items-center gap-2`}
                        >
                          {" "}
                          {/* Added flex and gap */}
                          {/* Display status text */}
                          <span>Status: {getStatusText(task.status)}</span>
                          {/* Edit Button */}
                          <button
                            onClick={() => {
                              setShowEditTaskModal(task); // Set the task to be edited
                              setEditedTask(task); // Initialize editedTask state
                            }}
                            className="text-blue-500 hover:text-blue-600 transition-colors"
                          >
                            <FaEdit />
                          </button>
                          {/* Delete Button */}
                          <button
                            onClick={() =>
                              handleDeleteTask(milestone.id, task.id)
                            }
                            className="text-red-500 hover:text-red-600 transition-colors"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      {/* Display task description if available */}
                      {task.description && (
                        <p className={`text-xs mt-2 ${styles.mutedText}`}>
                          {task.description}
                        </p>
                      )}
                      {/* Display task dates if available */}
                      {(task.startDate || task.dueDate) && ( // Changed from startsDate to startDate
                        <div className={`text-xs mt-2 ${styles.mutedText}`}>
                          {task.startDate && (
                            <span>
                              Start:{" "}
                              {new Date(task.startDate).toLocaleDateString()}
                            </span>
                          )}{" "}
                          {/* Changed from startsDate to startDate */}
                          {task.startDate && task.dueDate && (
                            <span className="mx-1">|</span>
                          )}{" "}
                          {/* Changed from startsDate to startDate */}
                          {task.dueDate && (
                            <span>
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="">
                        <StepActions
                          projectId={projectId.toString()}
                          stepId={task.id.toString()}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {milestones.length === 0 && (
          <div className={`text-center ${styles.mutedText} py-8`}>
            No milestones found for this project
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div
          className={`fixed inset-0 ${styles.modalOverlay} flex items-center justify-center z-50`}
        >
          <div
            className={`${styles.modalBg} p-6 rounded-lg w-96 ${styles.cardShadow}`}
          >
            <h3 className={`text-xl font-bold ${styles.headerText} mb-4`}>
              Add New Task to Milestone
            </h3>
            <input
              type="text"
              placeholder="Task Name"
              required
              value={newTask.title}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, title: e.target.value }))
              }
              className={`w-full mb-3 p-2 ${styles.inputBg} border ${styles.inputBorder} rounded ${styles.inputText}`}
            />
            <textarea
              placeholder="Description"
              value={newTask.description}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, description: e.target.value }))
              }
              className={`w-full mb-3 p-2 ${styles.inputBg} border ${styles.inputBorder} rounded ${styles.inputText}`}
              rows={3}
            />
            <input
              type="date"
              placeholder="Start Date (Optional)"
              value={newTask.startDate} // Changed from startsDate to startDate
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, startDate: e.target.value }))
              } // Changed from startsDate to startDate
              className={`w-full mb-3 p-2 ${styles.inputBg} border ${styles.inputBorder} rounded ${styles.inputText}`}
              style={{ colorScheme: theme === "light" ? "light" : "dark" }}
            />
            <input
              type="date"
              placeholder="Due Date (Optional)"
              value={newTask.dueDate}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              className={`w-full mb-3 p-2 ${styles.inputBg} border ${styles.inputBorder} rounded ${styles.inputText}`}
              style={{ colorScheme: theme === "light" ? "light" : "dark" }}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddTaskModal(null)} // Use renamed state
                className={`px-4 py-2 ${styles.buttonSecondary} ${styles.buttonSecondaryText} rounded`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddTask(showAddTaskModal)} // Use renamed state
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Add Step
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditTaskModal && editedTask && (
        <div
          className={`fixed inset-0 ${styles.modalOverlay} flex items-center justify-center z-50`}
        >
          <div
            className={`${styles.modalBg} p-6 rounded-lg w-96 ${styles.cardShadow}`}
          >
            <h3 className={`text-xl font-bold ${styles.headerText} mb-4`}>
              Edit Task
            </h3>
            <input
              type="text"
              placeholder="Task Name"
              required
              value={editedTask.title || ""}
              onChange={(e) =>
                setEditedTask((prev) => ({ ...prev, title: e.target.value }))
              }
              className={`w-full mb-3 p-2 ${styles.inputBg} border ${styles.inputBorder} rounded ${styles.inputText}`}
            />
            <textarea
              placeholder="Description"
              value={editedTask.description || ""}
              onChange={(e) =>
                setEditedTask((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className={`w-full mb-3 p-2 ${styles.inputBg} border ${styles.inputBorder} rounded ${styles.inputText}`}
              rows={3}
            />
            <input
              type="date"
              placeholder="Start Date (Optional)"
              value={formatDateForInput(editedTask.startDate)} // Format date for input
              onChange={(e) =>
                setEditedTask((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              className={`w-full mb-3 p-2 ${styles.inputBg} border ${styles.inputBorder} rounded ${styles.inputText}`}
              style={{ colorScheme: theme === "light" ? "light" : "dark" }}
            />
            <input
              type="date"
              placeholder="Due Date (Optional)"
              value={formatDateForInput(editedTask.dueDate)} // Format date for input
              onChange={(e) =>
                setEditedTask((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              className={`w-full mb-3 p-2 ${styles.inputBg} border ${styles.inputBorder} rounded ${styles.inputText}`}
              style={{ colorScheme: theme === "light" ? "light" : "dark" }}
            />
            <select
              value={editedTask.status ?? TASK_STATUS.PENDING} // Default to pending if status is null/undefined
              onChange={(e) =>
                setEditedTask((prev) => ({
                  ...prev,
                  status: parseInt(e.target.value),
                }))
              }
              className={`w-full mb-4 p-2 ${styles.inputBg} border ${styles.inputBorder} rounded ${styles.inputText}`}
              style={{ colorScheme: theme === "light" ? "light" : "dark" }}
            >
              <option value={TASK_STATUS.PENDING}>Pending</option>
              <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
              <option value={TASK_STATUS.FINISHED}>Finished</option>
            </select>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditTaskModal(null); // Close modal
                  setEditedTask(null); // Clear edited task state
                }}
                className={`px-4 py-2 ${styles.buttonSecondary} ${styles.buttonSecondaryText} rounded`}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTask} // Call update function
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showAddMilestoneModal && ( // Use renamed state
        <div
          className={`fixed inset-0 ${styles.modalOverlay} flex items-center justify-center z-50`}
        >
          <div
            className={`${styles.modalBg} p-6 rounded-lg w-96 ${styles.cardShadow}`}
          >
            <h3 className={`text-xl font-bold ${styles.headerText} mb-4`}>
              Add New Milestone
            </h3>
            <input
              type="text"
              placeholder="Title"
              value={newMilestone.title}
              onChange={(e) =>
                setNewMilestone((prev) => ({ ...prev, title: e.target.value }))
              }
              className={`w-full mb-3 p-2 ${styles.inputBg} border ${styles.inputBorder} rounded ${styles.inputText}`}
            />
            <textarea
              placeholder="Description"
              value={newMilestone.description}
              onChange={(e) =>
                setNewMilestone((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className={`w-full mb-3 p-2 ${styles.inputBg} border ${styles.inputBorder} rounded ${styles.inputText}`}
            />
            <input
              type="date"
              value={newMilestone.dueDate}
              onChange={(e) =>
                setNewMilestone((prev) => ({
                  ...prev,
                  dueDate: e.target.value,
                }))
              }
              className={`w-full mb-3 p-2 ${styles.inputBg} border ${styles.inputBorder} rounded ${styles.inputText}`}
              style={{ colorScheme: theme === "light" ? "light" : "dark" }}
            />
            <select
              value={newMilestone.status}
              onChange={(e) =>
                setNewMilestone((prev) => ({
                  ...prev,
                  status: e.target.value as Milestone["status"],
                }))
              }
              className={`w-full mb-4 p-2 ${styles.inputBg} border ${styles.inputBorder} rounded ${styles.inputText}`}
              style={{ colorScheme: theme === "light" ? "light" : "dark" }}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddMilestoneModal(false)} // Use renamed state
                className={`px-4 py-2 ${styles.buttonSecondary} ${styles.buttonSecondaryText} rounded`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddMilestone}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Add Milestone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectMilestones;
