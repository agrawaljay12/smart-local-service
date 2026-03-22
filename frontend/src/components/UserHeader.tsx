import { useState, useEffect } from "react";
import { FaBars, FaTimes, FaHome, FaServicestack, FaPhone, FaUser, FaMoon, FaSun, FaSignOutAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { isAuthenticated, getCurrentUser, clearAuthData } from "../utils/authHelper";

const PRIMARY_COLOR = '#0891b2';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  let sessionTimer: ReturnType<typeof setTimeout> | null = null;

  // Check login status on mount and restore session
  useEffect(() => {
    checkLoginStatus();
    initializeSessionTimeout();

    // Handle page visibility to manage session
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden
        console.log('Tab hidden - session will continue');
      } else {
        // Tab is visible - check if session is still valid
        if (isAuthenticated()) {
          resetSessionTimeout();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (sessionTimer) clearTimeout(sessionTimer);
    };
  }, []);

  const checkLoginStatus = () => {
    if (isAuthenticated()) {
      setIsLoggedIn(true);
      const user = getCurrentUser();
      if (user) {
        // Try to get name from various possible fields
        const displayName = user.first_name || user.name || user.fullName || user.username || user.email || 'User';
        setUserName(displayName);
      }
    } else {
      setIsLoggedIn(false);
      setUserName('');
    }
  };

  const initializeSessionTimeout = () => {
    // Clear existing timer
    if (sessionTimer) clearTimeout(sessionTimer);

    // Set new timer for session expiry
    if (isAuthenticated()) {
      sessionTimer = setTimeout(() => {
        handleLogout();
      }, SESSION_TIMEOUT);
    }
  };

  const resetSessionTimeout = () => {
    initializeSessionTimeout();
  };

  // Reset session timeout on user activity
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      if (isLoggedIn) {
        resetSessionTimeout();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [isLoggedIn]);

  const handleLogout = () => {
    // Clear all auth data
    clearAuthData();
    
    // Update state
    setIsLoggedIn(false);
    setUserName('');
    setIsOpen(false);

    // Navigate to home
    navigate('/');
    window.location.reload();
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinks = [
    { name: "Home", path: "/", icon: FaHome },
    { name: "Services", path: "#services", icon: FaServicestack },
    { name: "Contact", path: "#contact", icon: FaPhone },
    { name: "About", path: "#about", icon: FaUser },
  ];

  const bgColor = theme === 'dark' 
    ? 'linear-gradient(135deg, rgba(10, 10, 10, 0.98) 0%, rgba(5, 5, 5, 0.95) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.99) 0%, rgba(248, 248, 248, 0.98) 100%)';
  
  const borderColor = theme === 'dark' ? '1px solid rgba(8, 145, 178, 0.2)' : '1px solid rgba(8, 145, 178, 0.15)';

  return (
    <nav 
      className="sticky top-0 z-50 transition-all duration-300 backdrop-blur-md shadow-sm"
      style={{
        background: bgColor,
        borderBottom: borderColor,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/"
            className="flex items-center space-x-3 shrink-0 hover:opacity-80 transition-opacity duration-200"
          >
            <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow" style={{ background: 'linear-gradient(135deg, #14b8a6, #0891b2)' }}>
              <span 
                style={{ color: '#ffffff', fontFamily: 'var(--font-outfit)' }} 
                className="font-black text-xl"
              >
                S
              </span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span 
                style={{ fontFamily: 'var(--font-outfit)', color: PRIMARY_COLOR }} 
                className="text-lg font-bold tracking-tight"
              >
                Smart Local
              </span>
              <span 
                style={{ fontFamily: 'var(--font-worksans)', fontSize: '11px', opacity: 0.6 }}
                className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
              >
                Find Trusted Services
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#ffffff' : '#000000' }}
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-500/10 transition-all duration-200 flex items-center gap-2 group"
                >
                  <Icon size={16} className="group-hover:text-teal-500 transition-colors" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
            
            {/* Become a Provider Button - Only for logged-in users */}
            {isLoggedIn && (
              <Link
                to="/provider/register"
                style={{ fontFamily: 'var(--font-worksans)', backgroundColor: PRIMARY_COLOR, color: '#ffffff' }}
                className="px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all duration-200 ml-2 shadow-md"
              >
                Become a Provider
              </Link>
            )}
          </div>

          {/* Right side items */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200"
              style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
            </button>

            {/* Auth Buttons - Hidden on Mobile */}
            {isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-3 border-l-2" style={{ borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', paddingLeft: '1rem' }}>
                <span 
                  style={{ fontFamily: 'var(--font-worksans)', color: PRIMARY_COLOR }}
                  className="text-sm font-medium"
                >
                  Welcome, {userName}
                </span>
                <button
                  onClick={handleLogout}
                  style={{ fontFamily: 'var(--font-worksans)', backgroundColor: PRIMARY_COLOR, color: '#ffffff' }}
                  className="px-5 py-2 font-bold text-sm rounded-lg hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <FaSignOutAlt size={14} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 border-l-2" style={{ borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', paddingLeft: '1rem' }}>
                <Link
                  to="/auth/signin"
                  style={{ fontFamily: 'var(--font-worksans)', color: PRIMARY_COLOR }}
                  className="px-4 py-2 font-medium text-sm hover:opacity-80 transition-opacity duration-200 rounded-md"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/signup"
                  style={{ fontFamily: 'var(--font-outfit)', backgroundColor: PRIMARY_COLOR, color: '#ffffff' }}
                  className="px-5 py-2 font-bold text-sm rounded-lg hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg hover:bg-white/20 focus:outline-none transition-colors duration-200"
              style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
              aria-label="Toggle mobile menu"
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div 
            className="md:hidden pb-4 space-y-2 animate-fade-in"
            style={{ 
              backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.03)', 
              borderRadius: '0.75rem', 
              marginTop: '0.5rem',
              padding: '1rem'
            }}
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#ffffff' : '#000000' }}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-500/10 transition-all duration-200 flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Icon size={18} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
            
            {/* Mobile Become a Provider Button - Only for logged-in users */}
            {isLoggedIn && (
              <Link
                to="/provider/register"
                style={{ fontFamily: 'var(--font-worksans)', backgroundColor: PRIMARY_COLOR, color: '#ffffff' }}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all duration-200 flex items-center justify-center w-full shadow-md"
                onClick={() => setIsOpen(false)}
              >
                Become a Provider
              </Link>
            )}
            
            {/* Mobile Auth Buttons */}
            {isLoggedIn ? (
              <div className="border-t pt-4 mt-4 space-y-2" style={{ borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}>
                <p style={{ fontFamily: 'var(--font-worksans)', color: PRIMARY_COLOR }} className="px-4 py-2 text-sm font-semibold">
                  Welcome, {userName}
                </p>
                <button
                  onClick={handleLogout}
                  style={{ fontFamily: 'var(--font-worksans)', backgroundColor: PRIMARY_COLOR, color: '#ffffff' }}
                  className="w-full px-4 py-2.5 font-bold text-sm rounded-lg hover:opacity-90 transition-all duration-200 shadow-md flex items-center justify-center gap-2"
                >
                  <FaSignOutAlt size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="border-t pt-4 mt-4 space-y-2" style={{ borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}>
                <Link
                  to="/auth/signin"
                  style={{ fontFamily: 'var(--font-worksans)', color: PRIMARY_COLOR }}
                  className="w-full px-4 py-2.5 font-medium text-sm rounded-lg text-center block hover:opacity-80 transition-opacity duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/signup"
                  style={{ fontFamily: 'var(--font-outfit)', backgroundColor: PRIMARY_COLOR, color: '#ffffff' }}
                  className="w-full px-4 py-2.5 font-bold text-sm rounded-lg text-center block hover:opacity-90 transition-all duration-200 shadow-md"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
