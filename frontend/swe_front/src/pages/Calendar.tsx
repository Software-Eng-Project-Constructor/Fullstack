// (unchanged imports at top)
import React, { useState, useEffect } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  isSameDay,
  parseISO,
} from "date-fns";
import axios from "axios";
import Swal from "sweetalert2";
import { useTheme } from "../context/ThemeContext";

interface EventData {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  priority: string;
  category: string;
  projectId: number;
}

interface CalendarProps {
  projectId: number;
}

const Calendar: React.FC<CalendarProps> = ({ projectId }) => {
  if (!projectId || projectId === 0) {
    return (
      <div className="p-6 text-center text-red-500">
        ⚠️ Error: Missing or invalid project ID. Please select a project in the
        dashboard.
      </div>
    );
  }

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<EventData[]>([]);
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<EventData | null>(null);

  const [formData, setFormData] = useState<Omit<EventData, "id">>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    priority: "low",
    category: "work",
    projectId,
  });

  const getThemeStyles = () => {
    return theme === "light"
      ? {
          mainBg: "bg-gray-100",
          textColor: "text-gray-800",
          textMuted: "text-gray-500",
          cellBg: "bg-white",
          cellBgOtherMonth: "bg-gray-200 opacity-70",
          cellBorder: "border-gray-300",
          modalBg: "bg-white",
          inputBg: "bg-gray-50",
          inputBorder: "border-gray-300",
          inputText: "text-gray-800",
          buttonSecondary: "bg-gray-300 hover:bg-gray-400",
          buttonSecondaryText: "text-gray-800",
        }
      : {
          mainBg: "bg-[#0F0F0F]",
          textColor: "text-gray-200",
          textMuted: "text-gray-400",
          cellBg: "bg-[#1C1D1D]",
          cellBgOtherMonth: "bg-gray-800 opacity-50",
          cellBorder: "border-gray-700",
          modalBg: "bg-[#1C1D1D]",
          inputBg: "bg-[#0F0F0F]",
          inputBorder: "border-gray-700",
          inputText: "text-white",
          buttonSecondary: "bg-gray-600 hover:bg-gray-700",
          buttonSecondaryText: "text-white",
        };
  };

  const styles = getThemeStyles();
  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5001/api/events/project/${projectId}`
        );
        if (res.data.success) {
          setEvents(res.data.events);
        }
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Failed to load project events",
          icon: "error",
          confirmButtonColor: "#f97316",
        });
      }
    };
    fetchEvents();
  }, [projectId]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, projectId }));
  }, [projectId]);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setShowModal(true);
    setShowAddForm(false);
    setExpandedEvent(null);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = async () => {
    try {
      const toISO = (dateStr: string) => new Date(dateStr).toISOString();

      const eventData = {
        title: formData.title,
        description: formData.description,
        startDate: toISO(formData.startDate),
        endDate: toISO(formData.endDate),
        priority: formData.priority,
        category: formData.category,
        projectId,
      };

      const response = await axios.post(
        "http://localhost:5001/api/events",
        eventData
      );

      if (response.data.success) {
        const newEvent = { id: response.data.eventId, ...eventData };
        setEvents([...events, newEvent]);
        setFormData({
          title: "",
          description: "",
          startDate: "",
          endDate: "",
          priority: "low",
          category: "work",
          projectId,
        });
        setShowAddForm(false);
        Swal.fire({
          title: "Success!",
          text: "Event has been added to the project",
          icon: "success",
          confirmButtonColor: "#f97316",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to add event",
        icon: "error",
        confirmButtonColor: "#f97316",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await axios.delete(`http://localhost:5001/api/events/${eventId}`);
      setEvents(events.filter((e) => e.id !== eventId));
      setExpandedEvent(null);
      Swal.fire({
        title: "Deleted!",
        text: "Event has been removed.",
        icon: "success",
        confirmButtonColor: "#f97316",
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to delete event",
        icon: "error",
        confirmButtonColor: "#f97316",
      });
    }
  };

  return (
    <div className={`p-6 ${styles.mainBg} ${styles.textColor} min-h-screen`}>
      <div className="mb-6 flex items-center justify-between">
        <button
          className="text-sm text-orange-500 hover:underline"
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.setMonth(currentMonth.getMonth() - 1))
            )
          }
        >
          ← Prev
        </button>
        <h2 className="text-xl font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button
          className="text-sm text-orange-500 hover:underline"
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.setMonth(currentMonth.getMonth() + 1))
            )
          }
        >
          Next →
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-sm font-medium mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className={`${styles.textMuted}`}>
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {daysInMonth.map((day) => {
          const dayEvents = events.filter((e) =>
            isSameDay(parseISO(e.startDate), day)
          );
          return (
            <div
              key={format(day, "yyyy-MM-dd")}
              onClick={() => handleDayClick(day)}
              className={`p-2 rounded-md border h-24 overflow-hidden flex flex-col text-sm cursor-pointer transition-all
                ${
                  isSameMonth(day, currentMonth)
                    ? styles.cellBg
                    : styles.cellBgOtherMonth
                }
                ${isToday(day) ? "border-orange-500" : styles.cellBorder}
                hover:bg-orange-500 hover:text-white`}
            >
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span>{format(day, "d")}</span>
                {isToday(day) && <span className="text-orange-500">Today</span>}
              </div>

              <div className="space-y-0.5 overflow-hidden">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className="truncate text-xs px-1 py-0.5 bg-orange-500/80 text-white rounded"
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-orange-400">2+ events</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`${styles.modalBg} ${styles.textColor} p-6 rounded-lg w-full max-w-lg mx-4 shadow-lg`}
          >
            <h3 className="text-lg font-semibold mb-2">
              {format(selectedDate, "eeee, MMMM d")}
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {events.filter((e) =>
                isSameDay(parseISO(e.startDate), selectedDate)
              ).length === 0 ? (
                <p className={`${styles.textMuted} text-sm`}>
                  No events on this day.
                </p>
              ) : (
                events
                  .filter((e) => isSameDay(parseISO(e.startDate), selectedDate))
                  .map((event) => (
                    <div
                      key={event.id}
                      className="bg-orange-800 p-3 rounded-lg shadow-sm flex justify-between items-center"
                    >
                      <div className="text-sm font-medium truncate">
                        {event.title}
                      </div>
                      <div className="flex gap-3 text-xs">
                        <button
                          onClick={() => setExpandedEvent(event)}
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {expandedEvent && (
              <div className="mt-4 p-4 rounded-md bg-orange-100 dark:bg-orange-900 border border-orange-300 dark:border-orange-700">
                <h4 className="text-md font-semibold mb-2">Event Details</h4>
                <p>
                  <strong>Title:</strong> {expandedEvent.title}
                </p>
                <p>
                  <strong>Description:</strong> {expandedEvent.description}
                </p>
                <p>
                  <strong>Start:</strong>{" "}
                  {format(parseISO(expandedEvent.startDate), "MMM d, yyyy")}
                </p>
                <p>
                  <strong>End:</strong>{" "}
                  {format(parseISO(expandedEvent.endDate), "MMM d, yyyy")}
                </p>
                <p>
                  <strong>Priority:</strong> {expandedEvent.priority}
                </p>
                <p>
                  <strong>Category:</strong> {expandedEvent.category}
                </p>
              </div>
            )}

            {!showAddForm ? (
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setFormData((prev) => ({
                    ...prev,
                    startDate: format(selectedDate, "yyyy-MM-dd"),
                    endDate: format(selectedDate, "yyyy-MM-dd"),
                  }));
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded mt-4"
              >
                Add Event
              </button>
            ) : (
              <>
                <input
                  name="title"
                  placeholder="Title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full mt-4 mb-2 p-2 rounded ${styles.inputBg} ${styles.inputText} border ${styles.inputBorder}`}
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full mb-2 p-2 rounded ${styles.inputBg} ${styles.inputText} border ${styles.inputBorder}`}
                />
                <input
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full mb-2 p-2 rounded ${styles.inputBg} ${styles.inputText} border ${styles.inputBorder}`}
                />
                <input
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full mb-2 p-2 rounded ${styles.inputBg} ${styles.inputText} border ${styles.inputBorder}`}
                />
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={`w-full mb-2 p-2 rounded ${styles.inputBg} ${styles.inputText} border ${styles.inputBorder}`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full mb-4 p-2 rounded ${styles.inputBg} ${styles.inputText} border ${styles.inputBorder}`}
                >
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                </select>
                <button
                  onClick={handleAddEvent}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded"
                >
                  Save Event
                </button>
              </>
            )}

            <button
              onClick={() => {
                setShowModal(false);
                setShowAddForm(false);
                setSelectedDate(null);
                setExpandedEvent(null);
                setFormData((prev) => ({
                  ...prev,
                  title: "",
                  description: "",
                }));
              }}
              className={`${styles.buttonSecondary} mt-4 w-full py-2 px-4 rounded ${styles.buttonSecondaryText}`}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
