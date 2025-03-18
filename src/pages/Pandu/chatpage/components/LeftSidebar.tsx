"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, Plus, MessageSquare, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HistoryItem from "./HistoryItem";

interface Conversation {
  id: string;
  messages: any[];
  lastUpdated: number;
  projectname?: string;
  questionPreview?: string;
}

interface RepoData {
  branchname: string;
  repositoryname: string;
}

interface LeftSidebarProps {
  conversations: Conversation[];
  currentConversationId: string;
  onNewChat: () => void;
  onSelectConversation: (conversation: Conversation) => void;
  onToggle: () => void;
  isLoading?: boolean;
  userId: string;
  branch?: string;
  repositoryname?: string;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onToggle,
  isLoading,
  userId,
  branch,
  repositoryname,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [repoData, setRepoData] = useState<RepoData>({
    branchname: "",
    repositoryname: "",
  });
  const [fetchingRepoData, setFetchingRepoData] = useState(false);

  // Fetch repository info from the API.
  useEffect(() => {
    const fetchRepoData = async () => {
      try {
        setFetchingRepoData(true);
        const response = await fetch(`http://127.0.0.1:5000/get_questions?user_id=${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch repository data");
        }
        const data = await response.json();
        if (data && data.length > 0) {
          setRepoData({
            branchname: data[0].branchname || "",
            repositoryname: data[0].repositoryname || "",
          });
        }
      } catch (error) {
        console.error("Error fetching repository data:", error);
      } finally {
        setFetchingRepoData(false);
      }
    };
    fetchRepoData();
  }, [userId]);

  // Sort and filter conversations.
  const sortedConversations = [...conversations].sort(
    (a, b) => b.lastUpdated - a.lastUpdated
  );
  const filteredConversations = sortedConversations.filter((conv) =>
    conv.messages &&
    conv.messages.length > 0 &&
    (!searchTerm ||
      (conv.questionPreview && conv.questionPreview.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (conv.projectname && conv.projectname.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="h-full flex flex-col bg-white border-r shadow-md transition-all duration-300">
      {/* Top Section: Repo & Branch Info, Header, and Search */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-3 p-4 border-b border-purple-200 bg-gradient-to-r from-purple-50 to-white"
      >
        {/* Repository & Branch Info */}
    
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-purple-800">Chats</h2>
          </div>
          <button
            onClick={onToggle}
            className="p-2 rounded-full hover:bg-purple-100 transition-colors duration-200"
            title="Close Sidebar"
          >
            <ChevronLeft className="w-5 h-5 text-purple-600" />
          </button>
        </div>
        {/* Search and New Chat Row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <AnimatePresence>
              {searchTerm && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={handleClearSearch}
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={onNewChat}
            className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            title="New Chat"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-purple-50 p-4">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-purple-500 opacity-70">
            <MessageSquare className="w-10 h-10 mb-2" />
            <p className="text-sm">No previous chats.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((conv) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <HistoryItem
                  conversation={conv}
                  isActive={conv.id === currentConversationId}
                  onSelect={onSelectConversation}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
