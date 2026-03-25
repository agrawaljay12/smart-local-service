import { useState, useEffect, useRef } from "react";
import { FaUserCircle, FaChevronDown, FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import {Link } from "react-router-dom";
import { getCurrentUser } from "../../utils/authHelper";

export function AdminHeader() {
  const { theme, toggleTheme } = useTheme();
  

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<any>(null);

  const user = getCurrentUser();

  const userName =
    user?.name ||
    user?.email ||
    "Provider";


  // ✅ Handle hover open
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  // ✅ Handle hover close (with delay)
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  // ✅ Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // logout
const handleLogout = () => {
  localStorage.clear();
  window.location.replace("/auth/signin"); 
};

  return (
    <header
      className="h-16 flex items-center justify-end px-6 shadow-sm sticky top-0 z-40"
      style={{
        backgroundColor: theme === "dark" ? "#0a0a0a" : "#ffffff",
        borderBottom: "1px solid rgba(0,0,0,0.1)"
      }}
    >
      <div className="flex items-center gap-4">

        {/* Theme Toggle */}
        <button onClick={toggleTheme}>
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>

        {/* Profile Dropdown */}
        <div
          className="relative"
          ref={dropdownRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Trigger */}
          <div
            className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setIsOpen(!isOpen)}
          >
            <FaUserCircle size={22} />
            <span className="hidden sm:block text-sm font-medium">
              {userName}
            </span>
            <FaChevronDown size={12} />
          </div>

          {/* Invisible bridge (prevents flicker gap) */}
          <div className="absolute right-0 top-full h-2 w-full"></div>

          {/* Dropdown */}
          {isOpen && (
            <div
              className="absolute right-0 mt-2 w-52 rounded-lg shadow-lg py-2 z-50"
              style={{
                backgroundColor: theme === "dark" ? "#111" : "#fff",
                border: "1px solid rgba(0,0,0,0.1)"
              }}
            >
              {/* Username */}
              <div className="px-4 py-2 text-sm font-semibold border-b">
                {userName}
              </div>

              {/* Menu Items */}
              <Link
                to="/admin/view-profile"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
              >
                View Profile
              </Link>

              <Link
                to="/admin/edit-profile"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
              >
                Edit Profile
              </Link>

              <Link
                to="/admin/change-password"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
              >
                Change Password
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-500 text-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}