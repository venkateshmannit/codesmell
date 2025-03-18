"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  ChevronRight,
  ChevronDown,
  CopyIcon,
  Check,
  Download,
  Send,
  Sparkles,
  Loader2,
  Folder,
  GitBranch,
} from "lucide-react";
import { jsPDF } from "jspdf";
import axios from "axios";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import Header from "../../../components/Header";
import LeftSidebar from "../components/LeftSidebar";

// Dummy suggestions for the chat input
const suggestions = [
  { title: "", text: "what is the purpose of this project ?" },
  { title: "", text: "What are the key features of the project?" },
  { title: "", text: "Data flow of the project ?" },
];

 const ChatPage: React.FC = () => {
    const [selectedRepo, setSelectedRepo] = useState<{
      name: string
      branch: string
      tree?: any[]
    }>({
      name: "MyRepo",
      branch: "main",
    })

  const [inputText, setInputText] = useState("");
  // messages: current conversation messages; history: questions from DB
  const [messages, setMessages] = useState<Array<{ role: string; text: string }>>([]);
  const [history, setHistory] = useState<Array<{ id: number; text: string }>>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // State for README modal (from API response)
  const [readmeContent, setReadmeContent] = useState("");
  const [showReadmeModal, setShowReadmeModal] = useState(false);


  useEffect(() => {
    const storedRepo = sessionStorage.getItem("selectedRepo")
    if (storedRepo) {
      try {
        const parsed = JSON.parse(storedRepo)
        const repoName = parsed.repo || parsed.name
        setSelectedRepo({
          name: repoName,
          branch: parsed.branch,
          tree: undefined,
        })
      } catch (error) {
        console.error("Error parsing selectedRepo from session storage:", error)
      }
    }
  }, [])
  // Load user details from session storage (or use defaults)
  const [user, setUser] = useState<{
    id: number;
    username: string;
    api_key: string;
    authType: string;
  }>(() => {
    const storedUser = sessionStorage.getItem("userid");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        return { id: parsed.id || 1, ...parsed };
      } catch (error) {
        console.error("Error parsing user from session storage:", error);
      }
    }
    return {
      
      users_id: 8,
      chat_type: "tina",
      timestamp: "2023-03-14T12:00:00Z",
      message: "This is a test question from Postman"
    
    };
  });

  // Load selected assistant from session storage (or default to "tina")
  // Note: We removed JSON.parse() because the value is stored as plain text.
  const [selectedAssistant, setSelectedAssistant] = useState<string>(() => {
    const stored = sessionStorage.getItem("selectedAssistant");
    return stored ? stored : "tina";
  });

  // Refs for scrolling and input focus
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // IMPORTANT: CORS error explanation
  // The error "No 'Access-Control-Allow-Origin' header is present" indicates that your backend
  // at http://127.0.0.1:5000 is not sending the CORS headers to allow requests from http://localhost:5173.
  // To fix this in development without changing backend code, consider using a proxy or a browser extension.

  // Fetch chat history from your backend database
  const fetchHistory = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/get_questions/${user.id}`);
      setHistory(res.data);
      console.log("Fetched history from DB:", res.data);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Error fetching chat history from database.");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  // Simulate typing effect for bot response
  const simulateTypingEffect = (fullText: string) => {
    const lines = fullText.split("\n");
    let currentLine = 0;
    let currentChar = 0;
    let displayedText = "";

    const interval = setInterval(() => {
      if (currentLine < lines.length) {
        if (currentChar < lines[currentLine].length) {
          displayedText += lines[currentLine][currentChar];
          currentChar++;
        } else {
          displayedText += "\n";
          currentLine++;
          currentChar = 0;
        }
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[updatedMessages.length - 1] = { role: "bot", text: displayedText };
          return updatedMessages;
        });
      } else {
        clearInterval(interval);
        setIsLoading(false);
      }
    }, 50);
  };

  // Handler for asking a question
  const handleAsk = async () => {
    if (inputText.trim() === "") return;
    setIsLoading(true);

    // Add user's message to the chat
    const userMsg = { role: "user", text: inputText };
    setMessages((prev) => [...prev, userMsg]);
    // Show a placeholder bot message while waiting for response
    setMessages((prev) => [...prev, { role: "bot", text: "" }]);

    try {
      // Call your repository analysis API (simulate bot response)
     const res = await axios.post("http://127.0.0.1:5000/api/repositoryanalysis", {
        repository: selectedRepo.name,
        branch: selectedRepo.branch,
        query: inputText,
      })
      const { source, content } = res.data
      console.log(res.data)

      // Save the README content from the API response
      setReadmeContent(content)

      const fullResponseText = `${content}`
      simulateTypingEffect(fullResponseText)

      // Post the question to the database
      const payload = {
        users_id: user.id,
        chat_type: selectedAssistant, // using selectedAssistant from session
        timestamp: new Date().toISOString(),
        message: inputText,
      };
      const addRes = await axios.post("http://127.0.0.1:5000/add_question", payload);
      console.log("Add question response:", addRes.data);

      // Refresh the history from the database
      await fetchHistory();

      // Log full conversation details to the console
      console.log("Current messages:", [...messages, userMsg]);
      console.log("Database history:", history);
    } catch (error) {
      console.error("Error fetching query response:", error);
      toast.error("Error fetching query response");
      setMessages((prev) => prev.slice(0, -1));
      setIsLoading(false);
    }
    setInputText("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Handler for New Chat – clears the current conversation messages
  const handleNewChat = () => {
    setMessages([]);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleCopyAllHistory = () => {
    const fullConversationText = messages
      .map((msg) => `${msg.role === "user" ? "Q: " : "A: "}${msg.text}`)
      .join("\n\n");
    navigator.clipboard.writeText(fullConversationText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
    toast.success("Conversation copied to clipboard");
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
    toast.success("Conversation exported to PDF");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const handleSuggestionClick = (text: string) => {
    setInputText(text);
    inputRef.current?.focus();
  };

  // Show README modal when requested
  const handleShowReadme = () => {
    if (readmeContent) {
      setShowReadmeModal(true);
    } else {
      toast.error("README content not available");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative flex flex-col overflow-hidden">
        <div className="w-full fixed top-0 left-0 z-50">
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
          .spinner {
            border: 3px solid rgba(0, 128, 128, 0.1);
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border-left-color: #20b2aa;
            animation: spin 1s ease infinite;
            display: inline-block;
            vertical-align: middle;
            margin-left: 8px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .message-appear {
            animation: fadeIn 0.3s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
        <div className="flex h-screen w-full bg-teal-50 relative">
          <div className={`transition-all duration-300 ${isSidebarOpen ? "w-72" : "w-0"} overflow-hidden`}>
            <LeftSidebar
              repo={selectedRepo}
              history={history}
              onNewChat={handleNewChat}
              onCopy={(text) => {
                setInputText(text);
                inputRef.current?.focus();
              }}
              onToggle={toggleSidebar}
              onEdit={() => {}}
              onDelete={() => {}}
              onRename={() => {}}
              onArchive={() => {}}
              onExport={() => {}}
              onShowReadme={handleShowReadme}
            />
          </div>
          {!isSidebarOpen && (
            <button
              onMouseEnter={toggleSidebar}
              onClick={toggleSidebar}
              className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white border border-green-200 p-2 rounded-r-lg shadow-md hover:bg-green-50 transition-colors z-10"
              title="Open Sidebar"
            >
              <ChevronRight className="w-5 h-5 text-green-600" />
            </button>
          )}
          <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto pt-4 mt-16 px-4">
            {history.length === 0 && messages.length === 0 && (
              <div className="text-center mb-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MessageSquare className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-green-800 text-xl font-semibold mt-2">Explore Repository Insights</h2>
                <p className="text-green-600 mt-1">Ask your repository questions below.</p>
                <div className="inline-flex items-center mt-2 bg-green-100 px-3 py-1.5 rounded-full">
                  <Folder className="w-4 h-4 text-green-600 mr-1.5" />
                  <span className="text-sm text-green-700 font-medium">{selectedRepo.name}</span>
                  <span className="mx-1.5 text-green-500">•</span>
                  <GitBranch className="w-3.5 h-3.5 text-green-600 mr-1" />
                  <span className="text-sm text-green-700">{selectedRepo.branch || "main"}</span>
                </div>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-4 hide-scrollbar bg-white rounded-lg shadow-sm border border-green-100">
              <div className="flex justify-end items-center space-x-2 p-2 mb-2">
                <button
                  onClick={handleCopyAllHistory}
                  className="p-2 rounded-full hover:bg-green-100 transition-colors"
                  title="Copy full conversation"
                  disabled={messages.length === 0}
                >
                  {copySuccess ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <CopyIcon className="w-5 h-5 text-green-600" />
                  )}
                </button>
                <button
                  onClick={handleExportFullHistory}
                  className="p-2 rounded-full hover:bg-green-100 transition-colors"
                  title="Export full conversation to PDF"
                  disabled={messages.length === 0}
                >
                  <Download className="w-5 h-5 text-green-600" />
                </button>
              </div>
              {messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-4 message-appear ${msg.role === "user" ? "flex justify-end" : "flex justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
                        msg.role === "user"
                          ? "bg-green-100 text-green-800 rounded-tr-none"
                          : "bg-white border border-green-200 text-gray-800 rounded-tl-none"
                      }`}
                    >
                      {msg.text ? (
                        <ReactMarkdown
                          components={{
                            p: ({ node, ...props }) => (
                              <p className="prose prose-sm max-w-none prose-headings:text-green-800 prose-a:text-teal-600" {...props} />
                            ),
                            h1: ({ node, ...props }) => (
                              <h1 className="text-green-800 text-xl font-semibold mt-4 mb-2" {...props} />
                            ),
                            h2: ({ node, ...props }) => (
                              <h2 className="text-green-800 text-lg font-semibold mt-3 mb-2" {...props} />
                            ),
                            h3: ({ node, ...props }) => (
                              <h3 className="text-green-800 text-md font-semibold mt-3 mb-1" {...props} />
                            ),
                            a: ({ node, ...props }) => <a className="text-teal-600 underline" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2" {...props} />,
                            li: ({ node, ...props }) => <li className="my-1" {...props} />,
                            code: ({ node, inline, ...props }) =>
                              inline ? (
                                <code className="bg-green-50 px-1 py-0.5 rounded text-green-800 text-sm" {...props} />
                              ) : (
                                <code className="block bg-green-50 p-2 rounded text-green-800 text-sm my-2 overflow-x-auto" {...props} />
                              ),
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      ) : (
                        msg.role === "bot" && (
                          <div className="flex items-center space-x-2 text-green-600">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Tina is thinking...</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))
              ) : history.length === 0 ? (
                <div className="mt-8 space-y-8">
                  <div className="text-center">
                    <Sparkles className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <h3 className="text-lg font-medium text-green-800 mb-1">Start a conversation</h3>
                    <p className="text-green-600 text-sm max-w-md mx-auto">
                      Ask questions about your repository to get insights about its structure, functionality, and more.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-6">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-4 border border-green-200 rounded-lg bg-white shadow-sm w-60 text-sm cursor-pointer hover:bg-green-50 transition-all duration-200 hover:shadow group"
                        onClick={() => handleSuggestionClick(suggestion.text)}
                      >
                        <span className="text-teal-600 font-medium flex items-center">
                          <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                          {suggestion.text}
                        </span>
                        <p className="mt-2 text-green-700 group-hover:text-green-800 transition-colors"></p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-green-600">No messages yet. Start a conversation!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            {messages.length > 4 && (
              <button
                onClick={scrollToBottom}
                className="fixed bottom-24 right-8 bg-green-100 p-2 rounded-full shadow-md hover:bg-green-200 transition-colors z-10"
                title="Scroll to bottom"
              >
                <ChevronDown className="w-5 h-5 text-green-600" />
              </button>
            )}
            <div className="p-6">
              <div className="w-full flex border border-green-200 rounded-lg overflow-hidden bg-white shadow-md focus-within:ring-2 focus-within:ring-green-300">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask to explore your data"
                  className="flex-1 px-4 py-3 outline-none text-green-800 placeholder-green-400"
                  disabled={isLoading}
                />
                <button
                  className={`bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 transition-colors flex items-center justify-center ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                  onClick={handleAsk}
                  disabled={isLoading || !inputText.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-1" />
                      Ask
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-green-600 mt-2 text-center">Press Enter to send your message</p>
            </div>
          </main>
        </div>
      </div>
      {/* README Modal */}
      {showReadmeModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowReadmeModal(false)}></div>
          <div className="bg-white rounded-lg p-6 z-50 max-w-3xl w-full mx-4">
            <h2 className="text-xl font-bold mb-4">README.md</h2>
            <div className="prose prose-sm max-h-96 overflow-y-auto">
              <ReactMarkdown>{readmeContent}</ReactMarkdown>
            </div>
            <button className="mt-4 bg-teal-600 text-white px-4 py-2 rounded" onClick={() => setShowReadmeModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatPage;
