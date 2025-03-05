import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function Header() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    // Replace with your logout logic
    console.log("User logged out");
    setDropdownOpen(false);
  };

  return (
    <header className="relative flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
      <div className="flex items-center space-x-6">
        {/* Logo */}
        <a href="/" className="flex items-center space-x-2">
          <div className="h-12 w-12">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-12 w-12 text-white"
            >
              <path d="M15 5.5A2.5 2.5 0 0 0 12.5 3h-1.76a2.74 2.74 0 0 0-2.74 2.74v1.68a2.74 2.74 0 0 0 2.74 2.74h1.76A2.5 2.5 0 0 0 15 7.66" />
              <path d="M14 9.5a2.5 2.5 0 0 0-2.5 2.5v.76a2.74 2.74 0 0 1-2.74 2.74h-1.68A2.74 2.74 0 0 1 4.34 12.76v-1.76A2.5 2.5 0 0 1 6.84 8.5" />
              <path d="m7 15 4.5 4.5" />
              <path d="M19.5 4.5 15 9" />
              <path d="m15 4.5 3.5 3.5" />
            </svg>
          </div>
          <span className="text-xl font-bold">Code Sense AI</span>
        </a>

        {/* Navigation */}
        <nav className="flex items-center space-x-4">
          <a href="/AI section" className="px-3 py-1 rounded bg-gray-700 text-sm font-medium">
            Home
          </a>
          {/* Uncomment or add more links as needed */}
          <a href="/modeling" className="px-3 py-1 text-sm font-medium">
            Modeling
          </a> 
        </nav>
      </div>

      <div className="relative flex items-center space-x-2" ref={dropdownRef}>
        {/* Profile Avatar with Dropdown Toggle */}
        <button onClick={handleProfileClick} className="ml-4 flex items-center focus:outline-none">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-medium">
            MA
          </div>
          <ChevronDown size={16} className="ml-1" />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-12 w-48 bg-white text-black rounded shadow-md z-10">
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
  );
}
