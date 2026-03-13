import { useState } from "react";
import { FaBars, FaTimes, FaHome, FaServicestack, FaPhone, FaUser, FaMoon, FaSun } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinks = [
    { name: "Home", path: "/", icon: FaHome },
    { name: "Services", path: "#services", icon: FaServicestack },
    { name: "Contact", path: "#contact", icon: FaPhone },
    { name: "About", path: "#about", icon: FaUser },
  ];

  return (
    <nav className="sticky top-0 z-50 transition-colors duration-300" style={{ background: theme === 'dark' ? 'linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(0, 0, 0, 0.9) 100%)' : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)', backdropFilter: 'blur(12px)', borderBottom: theme === 'dark' ? '1px solid rgba(8, 145, 178, 0.15)' : '1px solid rgba(8, 145, 178, 0.2)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
              <span style={{ color: '#000000', fontFamily: 'var(--font-outfit)' }} className="font-black text-xl">S</span>
            </div>
            <span style={{ fontFamily: 'var(--font-outfit)', color: theme === 'dark' ? '#ffffff' : '#0891b2' }} className="text-xl font-bold hidden sm:inline tracking-tight">Smart Local</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#ffffff' : '#000000' }}
                  className="px-4 py-2 rounded-md text-sm font-medium hover:bg-white/20 transition-all duration-200 flex items-center space-x-1"
                >
                  <Icon size={16} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Theme Toggle, Auth Buttons and Mobile Menu Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200"
              style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <FaMoon size={20} /> : <FaSun size={20} />}
            </button>

            {/* Auth Buttons - Hidden on Mobile */}
            <div className="hidden sm:flex items-center space-x-2">
              <Link
                to="/auth/signin"
                style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#ffffff' : '#0891b2' }}
                className="px-4 py-2 font-medium text-sm hover:opacity-80 transition-opacity duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/auth/signup"
                style={{ fontFamily: 'var(--font-worksans)', backgroundColor: '#0891b2', color: '#ffffff' }}
                className="px-5 py-2 font-bold text-sm rounded-lg hover:opacity-90 transition-opacity duration-200 shadow-md hover:shadow-lg"
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-white/20 focus:outline-none transition-colors duration-200"
                style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
              >
                {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2" style={{ backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#ffffff' : '#000000' }}
                  className="block px-4 py-2 rounded-md text-sm font-medium hover:bg-white/20 transition-all duration-200 items-center space-x-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Icon size={18} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
            {/* Mobile Auth Buttons */}
            <div className="border-t border-opacity-20 pt-3 mt-3 space-y-2" style={{ borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}>
              <Link
                to="/auth/signin"
                style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#ffffff' : '#0891b2' }}
                className="w-full px-4 py-2 font-medium text-sm hover:opacity-80 transition-opacity duration-200 rounded-md text-center block"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/auth/signup"
                style={{ fontFamily: 'var(--font-worksans)', backgroundColor: '#0891b2', color: '#ffffff' }}
                className="w-full px-4 py-2 font-bold text-sm rounded-lg hover:opacity-90 transition-opacity duration-200 shadow-md block text-center"
                onClick={() => setIsOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
