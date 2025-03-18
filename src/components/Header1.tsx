// src/components/Header1.tsx
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LogoSVG from "../../assets/LogoSVG"; // Adjust the path if needed

export default function Header() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (
      location.pathname === "/modeling" ||
      location.pathname === "/panduchat"
    ) {
      sessionStorage.setItem("showNav", "true");
      setShowNav(true);
    } else {
      sessionStorage.setItem("showNav", "false");
      setShowNav(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    setShowLogoutConfirmation(true);
    setDropdownOpen(false);
  };

  const confirmLogout = () => {
    // Clear the stored table data and selected tables from localStorage on logout.
    localStorage.removeItem("tableData");
    localStorage.removeItem("selectedTables");
    logout(); // Calls the logout function from AuthContext
    navigate("/login"); // Redirects to the login page
    setShowLogoutConfirmation(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirmation(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate("/panduchat");
  };

  const handleModelingClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate("/modeling");
  };

  return (
    <>
      <header className="relative flex items-center justify-between px-4 py-1 bg-gray-800 text-white">
        <div className="flex items-center space-x-4">
          <a href="/AI section" className="flex items-center space-x-2">
            <div className="h-10 w-10">
              <LogoSVG />
            </div>
            <span className="text-lg sm:text-xl font-bold">Code Sense AI</span>
          </a>
          {showNav && (
            <>
              <a
                href="/panduchat"
                onClick={handleHomeClick}
                className="px-3 py-1 text-sm md:text-base font-medium hover:bg-gray-700 rounded"
              >
                Home
              </a>
              <a
                href="/modeling"
                onClick={handleModelingClick}
                className="px-3 py-1 text-sm md:text-base font-medium hover:bg-gray-700 rounded"
              >
                Modeling
              </a>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center">
          <button onClick={toggleMobileMenu} className="p-2 focus:outline-none">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="relative ml-2" ref={dropdownRef}>
            <button
              onClick={handleProfileClick}
              className="flex items-center focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-medium">
                {user ? user.username.charAt(0).toUpperCase() : "U"}
              </div>
              <ChevronDown size={16} className="ml-1" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-12 w-40 bg-white text-black rounded shadow-md z-10">
                <a
                  href="/AI section"
                  className="block text-left px-4 py-2 hover:bg-gray-200"
                >
                  AI Section
                </a>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center" ref={dropdownRef}>
          <button
            onClick={handleProfileClick}
            className="ml-4 flex items-center focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-medium">
              {user ? user.username.charAt(0).toUpperCase() : "U"}
            </div>
            <ChevronDown size={16} className="ml-1" />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-4 mt-12 w-40 bg-white text-black rounded shadow-md z-10">
              <a
                href="/AI section"
                className="block text-left px-4 py-2 hover:bg-gray-200"
              >
                AI Section
              </a>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-gray-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {mobileMenuOpen && showNav && (
        <nav className="md:hidden bg-gray-800 text-white px-4 py-2">
          <a
            href="/panduchat"
            onClick={handleHomeClick}
            className="px-3 py-1 text-sm md:text-base font-medium hover:bg-gray-700 rounded"
          >
            Home
          </a>
          <a
            href="/modeling"
            onClick={handleModelingClick}
            className="px-3 py-1 text-sm md:text-base font-medium hover:bg-gray-700 rounded"
          >
            Modeling
          </a>
        </nav>
      )}

      {showLogoutConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="bg-white p-6 rounded shadow-lg z-10">
            <p className="mb-4 text-sm md:text-base">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 bg-gray-200 rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-500 text-white rounded text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
