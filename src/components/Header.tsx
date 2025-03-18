import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LogoSVG from "../../assets/LogoSVG"; // Adjust the path if needed

export default function Header() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Use currentPath to check the current route
  const currentPath = decodeURIComponent(location.pathname);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setDropdownOpen((prev) => !prev);
  };

  // Logout confirmation modal display
  const handleLogout = () => {
    setShowLogoutConfirmation(true);
    setDropdownOpen(false);
  };

  const confirmLogout = () => {
    logout();
    navigate("/login");
    setShowLogoutConfirmation(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirmation(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  // Home button click handler
  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const loginOption = sessionStorage.getItem("loginOption");
    if (loginOption === "github") {
      navigate("/dashboard");
    } else if (loginOption === "demo") {
      navigate("/gitauth");
    } else {
      navigate("/AI Section");
    }
  };

  return (
    <>
      <header className="relative flex items-center justify-between px-4 py-1 bg-gray-800 text-white">
        {/* Left side: Logo and Home button (hide if current route is "/AI section") */}
        <div className="flex items-center space-x-4">
          <a href="/AI section" className="flex items-center space-x-2">
            <div className="h-10 w-10">
              <LogoSVG />
            </div>
            <span className="text-lg sm:text-xl font-bold">Code Sense AI</span>
          </a>
          {currentPath !== "/AI section" && (
            <a
              href="/repo history"
              onClick={handleHomeClick}
              className="px-3 py-1 text-sm md:text-base font-medium hover:bg-gray-700 rounded"
            >
              Home
            </a>
          )}
        </div>

        {/* Mobile menu button and profile */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleMobileMenu} className="p-2 focus:outline-none">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="relative ml-2" ref={dropdownRef}>
            <button onClick={handleProfileClick} className="flex items-center focus:outline-none">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-medium">
                {user ? user.username.charAt(0).toUpperCase() : "U"}
              </div>
              <ChevronDown size={16} className="ml-1" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-12 w-40 bg-white text-black rounded shadow-md z-10">
                <a href="/AI section" className="block text-left px-4 py-2 hover:bg-gray-200">
                  AI Section
                </a>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-200">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile dropdown for larger screens */}
        <div className="hidden md:flex items-center" ref={dropdownRef}>
          <button onClick={handleProfileClick} className="ml-4 flex items-center focus:outline-none">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-medium">
              {user ? user.username.charAt(0).toUpperCase() : "U"}
            </div>
            <ChevronDown size={16} className="ml-1" />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-4 mt-12 w-40 bg-white text-black rounded shadow-md z-10">
              <a href="/AI section" className="block text-left px-4 py-2 hover:bg-gray-200">
                AI Section
              </a>
              <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-200">
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile navigation menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-gray-800 text-white px-4 py-2">
          {currentPath !== "/AI section" && (
            <a
              href="/repo history"
              onClick={handleHomeClick}
              className="block px-3 py-1 text-sm hover:bg-gray-700 rounded"
            >
              Home
            </a>
          )}
        </nav>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black opacity-50"></div>
          {/* Modal Content */}
          <div className="bg-white p-6 rounded shadow-lg z-10">
            <p className="mb-4 text-sm md:text-base">Are you sure you want to logout?</p>
            <div className="flex justify-end space-x-4">
              <button onClick={cancelLogout} className="px-4 py-2 bg-gray-200 rounded text-sm">
                Cancel
              </button>
              <button onClick={confirmLogout} className="px-4 py-2 bg-red-500 text-white rounded text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
