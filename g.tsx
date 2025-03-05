import React, { useState } from "react";
import {
  Folder,
  FolderOpen,
  FileText,
  MessageSquare,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Header from "../../components/Header1";

// Sample repository data with a tree structure
const repoData = {
  name: "MyRepo",
  branch: "main",
  tree: [
    {
      type: "folder",
      name: "src",
      children: [
        { type: "file", name: "index.js" },
        { type: "file", name: "App.js" },
        {
          type: "folder",
          name: "components",
          children: [
            { type: "file", name: "Dashboard.js" },
            { type: "file", name: "Header.js" },
          ],
        },
      ],
    },
    { type: "file", name: "package.json" },
    { type: "file", name: "README.md" },
  ],
};

// Sample suggestions data
const suggestions = [
  {
    title: "Ranking",
    text: "Which are the top 3 cities with the highest number of orders?",
  },
  {
    title: "Aggregation",
    text: "What is the average score of reviews submitted for orders placed by customers in the last month?",
  },
  {
    title: "Aggregation",
    text: "What is the total value of payments made by customers from each state?",
  },
];

// Recursive component to render file tree nodes with advanced UI
const FileTree = ({ node }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (node.type === "file") {
    return (
      <div className="pl-6 flex items-center space-x-2 hover:bg-gray-100 p-1 rounded-md">
        <FileText className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-700">{node.name}</span>
      </div>
    );
  }

  return (
    <div className="pl-4">
      <div
        className="flex items-center space-x-2 cursor-pointer p-1 rounded-md hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <FolderOpen className="w-5 h-5 text-gray-600" />
        ) : (
          <Folder className="w-5 h-5 text-gray-600" />
        )}
        <span className="text-sm font-medium text-gray-800">{node.name}</span>
      </div>
      {isOpen && node.children && (
        <div className="ml-4 border-l border-gray-200">
          {node.children.map((child, index) => (
            <FileTree key={index} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

// Updated Left Sidebar: Two 50% Height Containers with internal scroll and hidden scrollbars
const LeftSidebar = ({ repo, history, onCopy, onToggle }) => {
  return (
    <div className="h-full flex flex-col bg-white border-r shadow-md">
      {/* Top Container (50%) */}
      <div className="h-1/2 flex flex-col">
        {/* Sidebar Header with Toggle Button */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{repo.name}</h1>
            <p className="text-sm text-gray-600">Branch: {repo.branch}</p>
          </div>
          <button
            className="p-1 rounded hover:bg-gray-200"
            onClick={onToggle}
            title="Close Sidebar"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        {/* Repository Tag */}
        <div className="px-4 py-2">
          <span className="bg-teal-200 text-teal-800 text-xs font-semibold px-2 py-1 rounded">
            Repository
          </span>
        </div>
        {/* File Tree with internal scroll */}
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
          {repo.tree.map((node, index) => (
            <FileTree key={index} node={node} />
          ))}
        </div>
      </div>
      {/* Bottom Container (50%) */}
      <div className="h-1/2 border-t flex flex-col">
        {/* Question History Header */}
        <div className="px-4 py-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Question History
          </h2>
        </div>
        {/* Question History List with internal scroll */}
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
          {history.length === 0 ? (
            <p className="text-gray-500 text-sm">No history yet.</p>
          ) : (
            history.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50"
              >
                <span className="text-gray-700 text-sm truncate">{item}</span>
                <Clock
                  className="w-4 h-4 text-gray-500 cursor-pointer"
                  onClick={() => onCopy(item)}
                  title="Copy question to input"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  // "messages" now represents the chat conversation as an array of objects: {sender, text}
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // When the user asks a question, add the user message and then simulate a dummy reply.
  const handleAsk = () => {
    if (inputText.trim() !== "") {
      const userMessage = { sender: "user", text: inputText };
      setMessages((prev) => [...prev, userMessage]);
      setInputText("");

      // Simulate a dummy reply after a short delay
      setTimeout(() => {
        const botReply = {
          sender: "bot",
          text: `Dummy reply regarding ${repoData.name}: We have received your query - "${userMessage.text}".`,
        };
        setMessages((prev) => [...prev, botReply]);
      }, 1000);
    }
  };

  // When a suggestion is clicked, place its text into the input field.
  const handleSuggestionClick = (text) => {
    setInputText(text);
  };

  // Copy question from left sidebar history into the input field.
  const handleCopyFromHistory = (text) => {
    setInputText(text);
  };

  // Toggle sidebar open/close
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <>
      {/* Inline style block to hide scrollbars without external CSS */}
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative flex flex-col">
        {/* Full-width fixed header */}
        <div className="w-full fixed top-0 left-0 z-50">
          <Header />
        </div>
        <div className="flex h-screen w-full bg-gray-100 relative mt-16">
          {/* Left Sidebar with transition */}
          <div
            className={`transition-all duration-300 ${
              isSidebarOpen ? "w-72" : "w-0"
            } overflow-hidden`}
          >
            <LeftSidebar
              repo={repoData}
              // Passing only user messages as question history
              history={messages.filter((msg) => msg.sender === "user").map((msg) => msg.text)}
              onCopy={handleCopyFromHistory}
              onToggle={toggleSidebar}
            />
          </div>

          {/* Toggle button when sidebar is closed */}
          {!isSidebarOpen && (
            <button
              onMouseEnter={toggleSidebar} // Automatically opens sidebar on hover
              onClick={toggleSidebar}
              className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white border p-2 rounded-r shadow-md hover:bg-gray-100"
              title="Open Sidebar"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {/* Main Content Chat Interface */}
          <main className="flex-1 flex flex-col relative">
            {/* Chat conversation container with hidden scrollbar */}
            <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
              {/* If no messages and input is empty, show suggestions */}
              {messages.length === 0 && inputText.trim() === "" ? (
                <div className="flex flex-wrap gap-4">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg bg-white shadow-lg w-60 text-sm cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSuggestionClick(suggestion.text)}
                    >
                      <span className="text-teal-600 font-semibold">
                        {suggestion.title}
                      </span>
                      <p className="mt-2 text-gray-700">{suggestion.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                // Otherwise, render chat messages
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-4 flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`inline-block p-3 rounded-lg max-w-xs ${
                        msg.sender === "user"
                          ? "bg-teal-600 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Input field fixed at bottom */}
            <div className="p-4 border-t bg-white">
              <div className="flex">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask to explore your data"
                  className="flex-1 px-4 py-2 outline-none text-gray-800"
                />
                <button
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 transition-colors"
                  onClick={handleAsk}
                >
                  Ask
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
