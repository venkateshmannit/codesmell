import React, { useState } from "react";
import {
  MessageSquare,
  ChevronRight,
  Copy as CopyIcon,
  Check,
  Download,
} from "lucide-react";
import { jsPDF } from "jspdf";
import Header from "../../components/Header1";
import LeftSidebar from "./panducom/LeftSidebar";

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

const Panduchat = () => {
  const [inputText, setInputText] = useState("");
  const [history, setHistory] = useState([]);
  const [archive, setArchive] = useState([]);
  const [messages, setMessages] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleAsk = () => {
    if (inputText.trim() !== "") {
      const newItem = { id: Date.now(), text: inputText };
      const userMsg = { role: "user", text: inputText };
      const botMsg = {
        role: "bot",
        text: `Repository '${repoData.name}' on branch '${repoData.branch}' includes ${repoData.tree.length} top-level items: ${repoData.tree
          .map((item) => item.name)
          .join(", ")}.`,
      };
      setMessages([...messages, userMsg, botMsg]);
      setHistory([newItem, ...history]);
      setInputText("");
    }
  };

  const handleSuggestionClick = (text) => {
    setInputText(text);
  };

  const handleCopyFromHistory = (text) => {
    setInputText(text);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleHistoryEdit = (id, newText) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text: newText } : item))
    );
  };

  const handleHistoryRename = (id) => {
    const newName = prompt("Enter new name for the history item:");
    if (newName && newName.trim() !== "") {
      setHistory((prev) =>
        prev.map((item) => (item.id === id ? { ...item, text: newName } : item))
      );
    }
  };

  const handleHistoryDelete = (id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleHistoryArchive = (id) => {
    const item = history.find((item) => item.id === id);
    if (item) {
      setArchive((prev) => [...prev, item]);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleHistoryExport = (id) => {
    const item = history.find((item) => item.id === id);
    if (item) {
      const doc = new jsPDF();
      doc.text(item.text, 10, 10);
      doc.save(`history-item-${id}.pdf`);
    }
  };

  const handleCopyAllHistory = () => {
    const fullConversationText = messages
      .map((msg) => `${msg.role === "user" ? "Q: " : "A: "}${msg.text}`)
      .join("\n\n");
    navigator.clipboard.writeText(fullConversationText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const handleExportFullHistory = () => {
    const doc = new jsPDF();
    let y = 10;
    doc.text("Conversation History", 10, y);
    y += 10;
    messages.forEach((msg) => {
      const prefix = msg.role === "user" ? "Q: " : "A: ";
      const lines = doc.splitTextToSize(prefix + msg.text, 180);
      doc.text(lines, 10, y);
      y += lines.length * 10;
    });
    doc.save("conversation.pdf");
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative flex flex-col overflow-hidden">
        <div className="w-full fixed top-0 left-0 z-50 ">
          <Header />
        </div>
        <style>{`
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-overscroll {
            overscroll-behavior: none;
          }
        `}</style>
        <div className="flex h-screen w-full bg-gray-100 relative ">
          <div
            className={`transition-all duration-300 ${isSidebarOpen ? "w-72" : "w-0"} overflow-hidden`}
          >
            <LeftSidebar
              repo={repoData}
              history={history}
              onCopy={handleCopyFromHistory}
              onToggle={toggleSidebar}
              onEdit={handleHistoryEdit}
              onDelete={handleHistoryDelete}
              onRename={handleHistoryRename}
              onArchive={handleHistoryArchive}
              onExport={handleHistoryExport}
            />
          </div>
          {!isSidebarOpen && (
            <button
              onMouseEnter={toggleSidebar}
              onClick={toggleSidebar}
              className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white border p-2 rounded-r shadow-md hover:bg-gray-100"
              title="Open Sidebar"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <main className="flex-1 flex flex-col w-full max-w-4xl mx-auto pt-4 mt-16">
            <div className="text-center mb-4">
              <MessageSquare className="w-10 h-10 text-gray-500 mx-auto" />
              <h2 className="text-gray-800 text-lg font-semibold mt-4">
                Explore Repository Insights
              </h2>
              <p className="text-gray-600">
                Ask your repository questions below.
              </p>
            </div>
            <div className="flex justify-end items-center space-x-2 p-2">
              <button onClick={handleCopyAllHistory} title="Copy full conversation">
                {copySuccess ? (
                  <Check className="w-5 h-5 text-purple-600" />
                ) : (
                  <CopyIcon className="w-5 h-5 text-purple-600" />
                )}
              </button>
              <button onClick={handleExportFullHistory} title="Export full conversation to PDF">
                <Download className="w-5 h-5 text-purple-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 hide-scrollbar no-overscroll">
              {messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}
                  >
                    <span
                      className={`inline-block p-2 rounded ${
                        msg.role === "user"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {msg.text}
                    </span>
                  </div>
                ))
              ) : (
                history.length === 0 && (
                  <div className="mt-4 flex space-x-4 justify-center">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg bg-white shadow-lg w-60 text-sm cursor-pointer hover:bg-purple-50 transition-colors"
                        onClick={() => handleSuggestionClick(suggestion.text)}
                      >
                        <span className="text-purple-600 font-semibold">
                          {suggestion.title}
                        </span>
                        <p className="mt-2 text-gray-700">
                          {suggestion.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
            <div className="p-4">
              <div className="w-full flex border rounded-lg overflow-hidden bg-white shadow-lg">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask to explore your data"
                  className="flex-1 px-4 py-2 outline-none text-gray-800"
                />
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 transition-colors"
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

export default Panduchat;
