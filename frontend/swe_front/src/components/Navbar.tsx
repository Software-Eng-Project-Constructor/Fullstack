import Logo from '../components/Logo';
import { Link } from "react-router-dom";
import { useState } from "react";
import { FaBell, FaEnvelope, FaUserAlt } from "react-icons/fa";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";


function Navbar() {
  const { isLoggedIn } = useAuth();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  return (
    <header className="w-full border-b border-gray-900 py-6 bg-[#0F0F0F]">
      <div className="container flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-white">
          <Logo />
        </Link>

        {/* Navigation */}
        <nav className="space-x-3 flex items-center">
          {isLoggedIn ? (
            <div className="flex space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("notifications")}
                  className="text-gray-300 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-[#1C1D1D] hover:text-white"
                >
                  <FaBell size={20} />
                </button>
                {openDropdown === "notifications" && (
                  <div className="absolute top-full right-0 bg-[#1C1D1D] text-white rounded-lg p-2 space-y-2 w-48 z-50">
                    <p className="p-2">New Comment on your post</p>
                    <p className="p-2">John liked your photo</p>
                    <p className="p-2">You have 3 unread messages</p>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("messages")}
                  className="text-gray-300 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-[#1C1D1D] hover:text-white"
                >
                  <FaEnvelope size={20} />
                </button>
                {openDropdown === "messages" && (
                  <div className="absolute top-full right-0 bg-[#1C1D1D] text-white rounded-lg p-2 space-y-2 w-48 z-50">
                    <p className="p-2">Message from Sarah</p>
                    <p className="p-2">Message from Alex</p>
                    <p className="p-2">Group Chat: Work Updates</p>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("profile")}
                  className="text-gray-300 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-[#1C1D1D] hover:text-white"
                >
                  <FaUserAlt size={20} />
                </button>
                {openDropdown === "profile" && (
                  <div className="absolute top-full right-0 bg-[#1C1D1D] text-white rounded-lg p-2 space-y-2 w-48 z-50">
                    <Link to="/profile" className="block p-2">
                      Edit Profile
                    </Link>
                    <Link to="/settings" className="block p-2">
                      Settings
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex space-x-4">
              <Link
                to="/signin"
                className="text-lg text-gray-300 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-[#1C1D1D] hover:text-white"
              >
                Sign In
              </Link>
              <Button text="Sign Up" link="/signup" />
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;