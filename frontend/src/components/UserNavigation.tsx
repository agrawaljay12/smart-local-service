import { useState, useEffect,useRef } from "react";
import {
  FaBars,
  FaTimes,
  FaServicestack,
  FaPhone,
  FaUser,
  FaMoon,
  FaSun
} 
from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { isAuthenticated, getCurrentUser, clearAuthData } from "../utils/authHelper";

const PRIMARY_COLOR = "#0891b2";

export function UserNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getCurrentUser());
    }
  }, []);

  const handleLogout = () => {
    clearAuthData();
    setUser(null);
    navigate("/");
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const userName =
    user?.first_name ||
    user?.name ||
    user?.username ||
    user?.email ||
    "User";

  const navLinks = [
    { name: "Services", path: "/user/services", icon: FaServicestack },
    { name: "Contact", path: "/user/contact", icon: FaPhone },
    { name: "About", path: "/user/about", icon: FaUser }
  ];

  const bgColor =
    theme === "dark"
      ? "linear-gradient(135deg, rgba(10,10,10,0.98), rgba(5,5,5,0.95))"
      : "linear-gradient(135deg, rgba(255,255,255,0.99), rgba(248,248,248,0.98))";

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md shadow-sm" style={{ background: bgColor }}>
      <div className="max-w-7xl mx-auto px-4">

        {/* Top Bar */}
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/user/home" className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #14b8a6, #0891b2)" }}
            >
              <span className="text-white font-bold">S</span>
            </div>
            <span style={{ color: PRIMARY_COLOR }} className="font-bold">
              Smart Local
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-teal-500/10 rounded"
                >
                  <Icon size={14} />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">

            {/* Theme Toggle */}
            <button onClick={toggleTheme}>
              {theme === "light" ? <FaMoon /> : <FaSun />}
            </button>

            {/* USER PROFILE DROPDOWN */}
            <div
              className="relative hidden sm:block"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              {/* Profile Icon */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
                style={{ backgroundColor: PRIMARY_COLOR }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <FaUser color="white" size={14} />
              </div>

              {/* Dropdown */}
              {isProfileOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg py-2 z-50"
                  style={{
                    backgroundColor: theme === "dark" ? "#111" : "#fff",
                    border: "1px solid rgba(0,0,0,0.1)"
                  }}
                >
                  {/* Username */}
                  <div className="px-4 py-2 border-b text-sm font-semibold">
                    {userName}
                  </div>

                  {/* Menu Items */}
                  <Link to="/user/profile" className="block px-4 py-2 hover:bg-gray-100">
                    Edit Profile
                  </Link>

                  <Link to="/user/change-password" className="block px-4 py-2 hover:bg-gray-100">
                    Change Password
                  </Link>

                  <Link to="/user/bookings" className="block px-4 py-2 hover:bg-gray-100">
                    Booking History
                  </Link>

                  <Link to="/user/booking-status" className="block px-4 py-2 hover:bg-gray-100">
                    Booking Status
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-500"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button className="md:hidden" onClick={toggleMenu}>
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-2 space-y-2">

            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block px-4 py-2 flex gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Icon />
                  {link.name}
                </Link>
              );
            })}

            {/* Mobile User Menu */}
            {user && (
              <>
                <div className="px-4 py-2 font-semibold">{userName}</div>

                <Link to="/user/profile" className="block px-4 py-2">
                  Edit Profile
                </Link>

                <Link to="/user/change-password" className="block px-4 py-2">
                  Change Password
                </Link>

                <Link to="/user/bookings" className="block px-4 py-2">
                  Booking History
                </Link>

                <Link to="/user/booking-status" className="block px-4 py-2">
                  Booking Status
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-500"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}