import React, { useEffect, useState } from "react";
import {
  FaChartLine,
  FaTasks,
  FaUsers,
  FaCogs,
  FaCalendarCheck,
  FaRocket,
} from "react-icons/fa";
import axios from "axios";
import { useTheme } from "../context/ThemeContext"; // Import ThemeContext

interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string;
  assignedTo: string;
  status: string;
}

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

interface EventData {
  id: string;
  title: string;
  description: string;
  startDate: string; // Use startDate as per Calendar.tsx
  endDate: string;   // Use endDate as per Calendar.tsx
  priority: string;
  category: string;
}

export interface OverviewPageProps {
  projectId: number;
  onTabChange: (tabName: string) => void;
}

const OverviewPage: React.FC<OverviewPageProps> = ({ projectId, onTabChange }) => {
  const { theme } = useTheme(); // Use theme context
  const [tasks, setTasks] = useState<Task[]>([]);

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Define theme-specific styles
  const getThemeStyles = (): { // <-- Add return type annotation here
    mainBg: string;
    mainShadow: string;
    mainText: string;
    headerText: string;
    subheaderText: string;
    cardBg: string;
    cardShadow: string;
    cardText: string;
    cardValueText: string;
    iconColor: string;
    cardClickableClass: string;
    avatarBg: string; // <-- Add avatarBg property
  } => {
    if (theme === 'light') {
      return {
        // Main container
        mainBg: 'bg-white',
        mainShadow: 'shadow-md',
        mainText: 'text-gray-800',

        // Headers
        headerText: 'text-orange-500',
        subheaderText: 'text-gray-600',

        // Stats cards
        cardBg: 'bg-gray-50',
        cardShadow: 'shadow-sm',
        cardText: 'text-gray-800',
        cardValueText: 'text-gray-700',

        // Icons
        iconColor: 'text-orange-500',

        cardClickableClass: 'cursor-pointer hover:shadow-lg hover:border-orange-500 border border-transparent transition-all duration-200',

        // Avatar placeholder
        avatarBg: 'bg-gray-300', // <-- This property was added

      };
    } else {
      return {
        // Main container
        mainBg: 'bg-[#0F0F0F]',
        mainShadow: 'shadow-lg',
        mainText: 'text-gray-200',

        // Headers
        headerText: 'text-orange-500',
        subheaderText: 'text-gray-400',

        // Stats cards
        cardBg: 'bg-[#1C1D1D]',
        cardShadow: 'shadow-md',
        cardText: 'text-gray-200',
        cardValueText: 'text-gray-300',

        // Icons
        iconColor: 'text-orange-500',

        cardClickableClass: 'cursor-pointer hover:shadow-lg hover:border-orange-500 border border-transparent transition-all duration-200',

        // Avatar placeholder
        avatarBg: 'bg-gray-600', // <-- This property was added
      };
    }
  };

  const styles = getThemeStyles();

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await axios.get(
        `http://localhost:5001/api/tasks?projectId=${projectId}`
      );
      setTasks(response.data);
    };

    fetchTasks();
  }, [projectId]);

  useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await axios.get(`http://localhost:5001/api/projects/${projectId}/members`);
                setMembers(response.data);
            } catch (error) {
                console.error("Error fetching members:", error);
                // Handle error appropriately (e.g., show a message)
            } finally {
                setIsLoadingMembers(false);
            }
        };

        fetchMembers();
    }, [projectId]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Assuming this endpoint fetches events for the specific project
                const response = await axios.get(`http://localhost:5001/api/projects/${projectId}/events`);
                setEvents(response.data);
            } catch (error) {
                console.error("Error fetching events:", error);
                // Handle error appropriately
            } finally {
                setIsLoadingEvents(false);
            }
        };

        fetchEvents();
    }, [projectId]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) =>
    ["Approved", "Status Negative"].includes(t.status)
  ).length;
  const progress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const overviewItems = [
    {
      icon: <FaChartLine />,
      label: "Progress",
      value: `${progress}% complete`,
      targetTab: "Milestones"
    },
    {
      icon: <FaTasks />,
      label: "Total Tasks",
      value: totalTasks,
      targetTab: "Tasks"
    },
    {
      icon: <FaCalendarCheck />,
      label: "Events",
      value: "Coming soon",
      targetTab: "Calendar"
    }
  ];

  const renderMemberAvatar = (member: TeamMember) => (
        member.user.profilePicPath ? (
            <img
                key={member.id} // Important for list rendering
                className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                src={member.user.profilePicPath}
                alt={member.user.name}
                title={member.user.name} // Add title for tooltip on hover
            />
        ) : (
            <div
                key={member.id} // Important for list rendering
                className={`h-8 w-8 rounded-full ${styles.avatarBg} border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-sm font-medium`}
                title={member.user.name} // Add title for tooltip on hover
            >
                {member.user.name.charAt(0).toUpperCase()}
            </div>
        )
    );

    const findClosestUpcomingEvent = (eventList: EventData[]): EventData | null => {
        const now = new Date();
        // Ensure we are comparing dates only, ignore time for "closest day" logic
        now.setHours(0, 0, 0, 0);

        const upcomingEvents = eventList.filter(event => {
            // Parse the startDate string from EventData
            const eventStartDate = new Date(event.startDate);
            eventStartDate.setHours(0, 0, 0, 0); // Compare dates only
            return eventStartDate >= now; // Keep events on or after today
        });

        if (upcomingEvents.length === 0) {
            return null; // No upcoming events
        }

        // Sort upcoming events by startDate
        upcomingEvents.sort((a, b) => {
            const dateA = new Date(a.startDate).getTime();
            const dateB = new Date(b.startDate).getTime();
            return dateA - dateB;
        });

        return upcomingEvents[0]; // The first one is the closest
    };

    const closestEvent = findClosestUpcomingEvent(events);

  return (
    <div className={`max-w-6xl mx-auto p-8 ${styles.mainBg} rounded-lg ${styles.mainShadow} ${styles.mainText}`}>
      <div className="mb-6 text-center">
        <h1 className={`text-3xl font-bold ${styles.headerText}`}>Project Overview</h1>
        <p className={styles.subheaderText}>Overview for Project ID: {projectId}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Render standard overview items (excluding Team) */}
        {overviewItems.map((item, idx) => (
          <div
            key={idx}
            className={`${styles.cardBg} p-6 rounded-lg text-center ${styles.cardShadow} ${styles.cardClickableClass}`}
            onClick={() => onTabChange(item.targetTab)}
          >
            <div className={`text-4xl ${styles.iconColor} mb-4`}>{item.icon}</div>
            <h3 className={`text-xl font-semibold mb-2 ${styles.cardText}`}>{item.label}</h3>
            {item.label === "Events" ? (
                 isLoadingEvents ? (
                     <p className={styles.cardValueText}>Loading events...</p>
                 ) : closestEvent ? (
                     // Display the start date of the closest event
                     // Format the date as needed, e.g., using toLocaleDateString()
                     <p className={styles.cardValueText}>
                         {new Date(closestEvent.startDate).toLocaleDateString()}
                     </p>
                 ) : (
                     <p className={styles.cardValueText}>No upcoming events</p>
                 )
             ) : (
                 // Render original value for other items (like Progress, Total Tasks)
                 <p className={styles.cardValueText}>{item.value}</p>
             )}
          </div>
        ))}

        {/* Render the Team card separately to customize its content */}
        <div
            className={`${styles.cardBg} p-6 rounded-lg text-center ${styles.cardShadow} ${styles.cardClickableClass}`}
            onClick={() => onTabChange("Members")} // Make sure this navigates to the Members tab
        >
            <div className={`text-4xl ${styles.iconColor} mb-4`}><FaUsers /></div> {/* Team Icon */}
            <h3 className={`text-xl font-semibold mb-2 ${styles.cardText}`}>Team</h3>
            {/* Conditional rendering for loading, empty state, and members */}
            {isLoadingMembers ? (
                <p className={styles.cardValueText}>Loading members...</p>
            ) : members.length === 0 ? (
                <p className={styles.cardValueText}>No members yet</p>
            ) : (
                // Container for avatars - uses flexbox and negative margin for stacking effect
                <div className="flex justify-center -space-x-2 overflow-hidden">
                    {/* Render a limited number of avatars using the helper function */}
                    {members.slice(0, 5).map(renderMemberAvatar)} {/* Display up to 5 avatars */}
                    {/* Add "+ more" indicator if there are more than 5 */}
                    {members.length > 5 && (
                        <div
                            className={`h-8 w-8 rounded-full ${styles.avatarBg} border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-medium`}
                            title={`${members.length - 5} more members`} // Tooltip shows count
                        >
                            +{members.length - 5}
                        </div>
                    )}
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default OverviewPage;