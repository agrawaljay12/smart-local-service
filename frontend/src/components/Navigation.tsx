import { useState } from "react";
import { FaBars, FaTimes, FaHome, FaServicestack, FaPhone, FaUser, FaMoon, FaSun } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const PRIMARY_COLOR = '#0891b2';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { name: "Home", path: "/", icon: FaHome },
    { name: "Services", path: "guest/services", icon: FaServicestack },
    { name: "Contact", path: "/guest/contact", icon: FaPhone },
    { name: "About", path: "/guest/about", icon: FaUser },
  ];

  const bgColor = theme === 'dark' 
    ? 'linear-gradient(135deg, rgba(10, 10, 10, 0.98) 0%, rgba(5, 5, 5, 0.95) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.99) 0%, rgba(248, 248, 248, 0.98) 100%)';
  
  const borderColor = theme === 'dark'
    ? '1px solid rgba(8, 145, 178, 0.2)'
    : '1px solid rgba(8, 145, 178, 0.15)';

  return (
    <nav 
      className="sticky top-0 z-50 backdrop-blur-md shadow-sm"
      style={{ background: bgColor, borderBottom: borderColor }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Bar */}
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #14b8a6, #0891b2)' }}>
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span style={{ color: PRIMARY_COLOR }} className="font-bold">
              Smart Local
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className="px-4 py-2 text-sm flex items-center gap-2 hover:bg-teal-500/10 rounded"
                >
                  <Icon size={16} />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">

            {/* Theme Toggle */}
            <button onClick={toggleTheme}>
              {theme === 'light' ? <FaMoon /> : <FaSun />}
            </button>

            {/* Static Auth Buttons */}
            <div className="hidden sm:flex gap-2">
              <Link to="/auth/signin" className="px-3 py-1">
                Sign In
              </Link>
              <Link
                to="/auth/signup"
                style={{ backgroundColor: PRIMARY_COLOR, color: '#fff' }}
                className="px-3 py-1 rounded"
              >
                Sign Up
              </Link>
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
                  className="block px-4 py-2 flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Icon />
                  {link.name}
                </Link>
              );
            })}

            <Link to="/auth/signin" className="block px-4 py-2">
              Sign In
            </Link>
            <Link
              to="/auth/signup"
              className="block px-4 py-2 text-white rounded"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}