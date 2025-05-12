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
} from "date-fns";
import axios from "axios";
import Swal from "sweetalert2";
import { useTheme } from "../context/ThemeContext"; // Import ThemeContext

interface EventData {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  priority: string;
  category: string;
}

const Calendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<EventData[]>([]);
  const { theme } = useTheme(); // Use theme context

  const [viewEvent, setViewEvent] = useState<EventData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Omit<EventData, "id">>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    priority: "low",
    category: "work",
  });

  // Define theme-specific styles
  const getThemeStyles = () => {
    if (theme === 'light') {
      return {
        // Main background and text
        mainBg: 'bg-gray-100',
        textColor: 'text-gray-800',
        textMuted: 'text-gray-500',
        
        // Calendar cells
        cellBg: 'bg-white',
        cellBgOtherMonth: 'bg-gray-200 opacity-70',
        cellBorder: 'border-gray-300',
        
        // Modal styles
        modalBg: 'bg-white',
        inputBg: 'bg-gray-50',
        inputBorder: 'border-gray-300',
        inputText: 'text-gray-800',
        
        // Buttons and accents
        buttonSecondary: 'bg-gray-300 hover:bg-gray-400',
        buttonSecondaryText: 'text-gray-800',
      };
    } else {
      return {
        // Main background and text
        mainBg: 'bg-[#0F0F0F]',
        textColor: 'text-gray-200',
        textMuted: 'text-gray-400',
        
        // Calendar cells
        cellBg: 'bg-[#1C1D1D]',
        cellBgOtherMonth: 'bg-gray-800 opacity-50',
        cellBorder: 'border-gray-700',
        
        // Modal styles
        modalBg: 'bg-[#1C1D1D]',
        inputBg: 'bg-[#0F0F0F]',
        inputBorder: 'border-gray-700',
        inputText: 'text-white',
        
        // Buttons and accents
        buttonSecondary: 'bg-gray-600 hover:bg-gray-700',
        buttonSecondaryText: 'text-white',
      };
    }
  };

  const styles = getThemeStyles();

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await axios.get("http://localhost:5001/api/events");
      setEvents(res.data);
    };
    fetchEvents();
  }, []);

  const handleDayClick = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");

    const matchedEvent = events.find(
      (event) =>
        event.startDate <= formattedDate && event.endDate >= formattedDate
    );

    if (matchedEvent) {
      setViewEvent(matchedEvent);
      setShowModal(false);
    } else {
      setFormData((prev) => ({
        ...prev,
        startDate: formattedDate,
        endDate: formattedDate,
      }));
      setShowModal(true);
      setViewEvent(null);
    }
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
      const newEvent: EventData = {
        id: Date.now().toString(),
        ...formData,
      };

      await axios.post("http://localhost:5001/api/events", newEvent);
      setEvents([...events, newEvent]);
      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        priority: "low",
        category: "work",
      });
      setShowModal(false);

      // Show success notification
      Swal.fire({
        title: 'Success!',
        text: 'Event has been added successfully',
        icon: 'success',
        confirmButtonColor: '#f97316',
      });
    } catch (error) {
      console.error('Error adding event:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to add event',
        icon: 'error',
        confirmButtonColor: '#f97316',
      });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5001/api/events/${id}`);
      setEvents(events.filter((e) => e.id !== id));
      setViewEvent(null);

      // Show success notification
      Swal.fire({
        title: 'Deleted!',
        text: 'Event has been deleted successfully',
        icon: 'success',
        confirmButtonColor: '#f97316',
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete event',
        icon: 'error',
        confirmButtonColor: '#f97316',
      });
    }
  };

  const changeMonth = (offset: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  return (
    <div className={`p-6 ${styles.mainBg} ${styles.textColor} min-h-screen`}>
      <div className="flex justify-between items-center mb-4">
        <button
          className="text-orange-500 hover:text-orange-600"
          onClick={() => changeMonth(-1)}
        >
          &lt; Prev
        </button>
        <h2 className="text-xl font-bold text-orange-500">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button
          className="text-orange-500 hover:text-orange-600"
          onClick={() => changeMonth(1)}
        >
          Next &gt;
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className={`font-semibold ${styles.textMuted}`}>
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {daysInMonth.map((day) => {
          const formatted = format(day, "yyyy-MM-dd");
          const eventOnDay = events.find(
            (e) => e.startDate <= formatted && e.endDate >= formatted
          );

          return (
            <div
              key={formatted}
              onClick={() => handleDayClick(day)}
              className={`p-2 rounded-md border cursor-pointer transition-all
                ${isSameMonth(day, currentMonth) ? styles.cellBg : styles.cellBgOtherMonth}
                ${isToday(day) ? "border-orange-500" : styles.cellBorder}
                hover:bg-orange-500 hover:text-white`}
            >
              <div>{format(day, "d")}</div>
              {eventOnDay && (
                <div className="text-xs mt-1 truncate text-orange-400">
                  {eventOnDay.title}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* View or Add Event Modal */}
      {(viewEvent || showModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${styles.modalBg} ${styles.textColor} p-6 rounded-lg w-96 shadow-lg`}>
            {viewEvent ? (
              <>
                <h3 className="text-xl font-bold mb-2">{viewEvent.title}</h3>
                <p className={`text-sm ${styles.textMuted}`}>{viewEvent.description}</p>
                <p className="text-sm mt-2">
                  <strong>Start:</strong> {viewEvent.startDate}
                </p>
                <p className="text-sm">
                  <strong>End:</strong> {viewEvent.endDate}
                </p>
                <p className="text-sm">
                  <strong>Priority:</strong> {viewEvent.priority}
                </p>
                <p className="text-sm mb-4">
                  <strong>Category:</strong> {viewEvent.category}
                </p>
                <div className="flex justify-between">
                  <button
                    className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-white"
                    onClick={() => handleDeleteEvent(viewEvent.id)}
                  >
                    Delete
                  </button>
                  <button
                    className={`${styles.buttonSecondary} px-4 py-1 rounded ${styles.buttonSecondaryText}`}
                    onClick={() => setViewEvent(null)}
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-2">Add Event</h3>
                <input
                  name="title"
                  placeholder="Title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full mb-2 p-2 rounded ${styles.inputBg} ${styles.inputText} border ${styles.inputBorder} appearance-none`}
                  style={{ colorScheme: theme === 'light' ? 'light' : 'dark' }}
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full mb-2 p-2 rounded ${styles.inputBg} ${styles.inputText} border ${styles.inputBorder} appearance-none`}
                  style={{ colorScheme: theme === 'light' ? 'light' : 'dark' }}
                />
                <input
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full mb-2 p-2 rounded ${styles.inputBg} ${styles.inputText} border ${styles.inputBorder} appearance-none`}
                  style={{ colorScheme: theme === 'light' ? 'light' : 'dark' }}
                />
                <input
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full mb-2 p-2 rounded ${styles.inputBg} ${styles.inputText} border ${styles.inputBorder} appearance-none`}
                  style={{ colorScheme: theme === 'light' ? 'light' : 'dark' }}
                />
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={`w-full mb-2 p-2 rounded ${styles.inputBg} ${styles.inputText} border ${styles.inputBorder}`}
                  style={{ colorScheme: theme === 'light' ? 'light' : 'dark' }}
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
                  style={{ colorScheme: theme === 'light' ? 'light' : 'dark' }}
                >
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                </select>
                <div className="flex justify-between">
                  <button
                    className="bg-orange-500 hover:bg-orange-600 px-4 py-1 rounded text-white"
                    onClick={handleAddEvent}
                  >
                    Save
                  </button>
                  <button
                    className={`${styles.buttonSecondary} px-4 py-1 rounded ${styles.buttonSecondaryText}`}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;