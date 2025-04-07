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

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await axios.get("http://localhost:3001/events");
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = async () => {
    const newEvent: EventData = {
      id: Date.now().toString(),
      ...formData,
    };

    await axios.post("http://localhost:3001/events", newEvent);
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
  };

  const handleDeleteEvent = async (id: string) => {
    await axios.delete(`http://localhost:3001/events/${id}`);
    setEvents(events.filter((e) => e.id !== id));
    setViewEvent(null);
    
  };

  const changeMonth = (offset: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  return (
    <div className="p-6 bg-[#0F0F0F] text-gray-200 min-h-screen">
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

      <div className="grid grid-cols-7 gap-2 text-center text-gray-400 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="font-semibold">
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
              className={`p-2 rounded-md border text-white cursor-pointer transition-all
                ${isSameMonth(day, currentMonth) ? "bg-[#1C1D1D]" : "bg-gray-800 opacity-50"}
                ${isToday(day) ? "border-orange-500" : "border-gray-700"}
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
          <div className="bg-[#1C1D1D] text-white p-6 rounded-lg w-96 shadow-lg">
            {viewEvent ? (
              <>
                <h3 className="text-xl font-bold mb-2">{viewEvent.title}</h3>
                <p className="text-sm text-gray-400">{viewEvent.description}</p>
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
                    className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded"
                    onClick={() => handleDeleteEvent(viewEvent.id)}
                  >
                    Delete
                  </button>
                  <button
                    className="bg-gray-600 hover:bg-gray-700 px-4 py-1 rounded"
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
                  className="w-full mb-2 p-2 rounded bg-[#0F0F0F] text-white border border-gray-700 appearance-none"
                  style={{ colorScheme: "dark" }}
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full mb-2 p-2 rounded bg-[#0F0F0F] text-white border border-gray-700 appearance-none"
                  style={{ colorScheme: "dark" }}
                />
                <input
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full mb-2 p-2 rounded bg-[#0F0F0F] text-white border border-gray-700 appearance-none"
                  style={{ colorScheme: "dark" }}
                />
                <input
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full mb-2 p-2 rounded bg-[#0F0F0F] text-white border border-gray-700 appearance-none"
                  style={{ colorScheme: "dark" }}
                />
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full mb-2 p-2 rounded bg-[#0F0F0F] text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full mb-4 p-2 rounded bg-[#0F0F0F] text-white"
                >
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                </select>
                <div className="flex justify-between">
                  <button
                    className="bg-orange-500 hover:bg-orange-600 px-4 py-1 rounded"
                    onClick={handleAddEvent}
                  >
                    Save
                  </button>
                  <button
                    className="bg-gray-600 hover:bg-gray-700 px-4 py-1 rounded"
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
