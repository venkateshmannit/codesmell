import React from "react";
import { ChevronDown } from "lucide-react";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
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
          <a href="/" className="px-3 py-1 rounded bg-gray-700 text-sm font-medium">
            Home
          </a>
          <a href="/modeling" className="px-3 py-1 text-sm font-medium">
            Modeling
          </a>
        </nav>
      </div>

      <div className="flex items-center space-x-2">
        {/* User and Project Selection */}
        {/* <div className="flex items-center">
          <button className="flex items-center space-x-1 text-sm">
            <span>Mannit</span>
            <ChevronDown size={16} />
          </button>
        </div>

        <div className="text-gray-500 mx-2">/</div>

        <div className="flex items-center">
          <button className="flex items-center space-x-1 text-sm">
            <span>Default Project</span>
            <ChevronDown size={16} />
          </button>
        </div> */}

        {/* Avatar */}
        <div className="ml-4">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-medium">
            MA
          </div>
        </div>
      </div>
    </header>
  );
}
