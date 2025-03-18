import React, { useState } from "react";
import {
  ChevronLeft,
  Plus,
  Folder,
  GitBranch,
  History,
  LayoutDashboard,
} from "lucide-react";
import { motion } from "framer-motion";
import HistoryItem from "./HistoryItem";

// Updated interface to include additional conversation details.
interface HistoryData {
  id: number;
  question: string;
  answer: string;
  repositoryname: string;
  branchname: string;
}

interface LeftSidebarProps {
  repo?: { name: string; branch: string; tree?: any[] };
  history?: HistoryData[];
  onNewChat: () => void;
  onCopy: (question: string) => void;
  onToggle: () => void;
  onEdit: (id: number, question: string) => void;
  onDelete: (id: number) => void;
  onRename: (id: number) => void;
  onArchive: (id: number) => void;
  onExport: (id: number) => void;
  onShowReadme: () => void;
  onHistorySelect: (item: HistoryData) => void;
}

// Local Badge component
const Badge: React.FC<
  React.HTMLAttributes<HTMLSpanElement> & { variant?: string }
> = ({ children, ...props }) => {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      {...props}
    >
      {children}
    </span>
  );
};

// Local Separator component
const Separator: React.FC<React.HTMLAttributes<HTMLHRElement>> = ({
  className,
  ...props
}) => <hr className={className} {...props} />;

// Local ScrollArea component using inline styles to hide scrollbar
const ScrollArea: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
      className={`overflow-auto ${className || ""}`}
      {...props}
    >
      {children}
    </div>
  );
};

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  repo,
  history = [],
  onNewChat,
  onCopy,
  onToggle,
  onEdit,
  onDelete,
  onRename,
  onArchive,
  onExport,
  onShowReadme,
  onHistorySelect,
}) => {
  // State to control the number of history items shown.
  const [visibleCount, setVisibleCount] = useState(5);
  // State to track which history item is expanded.
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);

  const handleToggleExpand = (id: number) => {
    setExpandedHistoryId(expandedHistoryId === id ? null : id);
  };

  const isReadmeDisabled = history?.length === 0;

  return (
    <div className="flex flex-col bg-white border-r border-green-200 shadow-md min-w-[280px] pt-16 h-screen">
      {/* Top Section: Repository Info & Actions */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="border-b border-green-200 bg-green-50 px-3 py-2 flex items-center justify-between"
      >
        {/* Repo Info */}
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 p-2 rounded-md shadow-sm">
            <Folder className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-green-800 truncate max-w-[130px]">
              {repo?.name}
            </h1>
            <div className="flex items-center text-xs text-green-600 mt-0.5">
              <GitBranch className="w-3.5 h-3.5 mr-1" />
              <p className="font-medium truncate">{repo?.branch || "main"}</p>
            </div>
          </div>
        </div>
        {/* Actions */}
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full hover:bg-green-100 transition-colors"
            onClick={onNewChat}
            title="New Chat"
          >
            <Plus className="w-5 h-5 text-green-600" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full hover:bg-green-100 transition-colors"
            onClick={onToggle}
            title="Close Sidebar"
          >
            <ChevronLeft className="w-5 h-5 text-green-600" />
          </motion.button>
        </div>
      </motion.div>

      {/* Secondary Info Section */}
      {/* <div className="bg-white border-b border-green-200 px-4 py-2 flex items-center space-x-2">
        <LayoutDashboard className="w-4 h-4 text-green-600" />
        <Badge className="bg-teal-100 text-teal-800 border border-teal-200">
          Repository
        </Badge>
      </div> */}

      {/* README Button */}
      {/* <div className="px-4 py-3 bg-green-50 border-b border-green-200 flex justify-center">
        <div className="group relative">
          <motion.button
            whileHover={isReadmeDisabled ? {} : { scale: 1.03 }}
            whileTap={isReadmeDisabled ? {} : { scale: 0.98 }}
            onClick={onShowReadme}
            className={`bg-green-100 px-4 py-2 rounded-md shadow-sm transition-colors w-full max-w-[180px] text-sm font-semibold text-green-800 flex items-center space-x-2 justify-center
              ${
                isReadmeDisabled
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-green-200"
              }`}
            disabled={isReadmeDisabled}
          >
            <Folder className="w-4 h-4 text-green-600" />
            <span>README.md</span>
          </motion.button>
          {isReadmeDisabled && (
            <div className="absolute bottom-[110%] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Please ask a question first
            </div>
          )}
        </div>
      </div> */}

      {/* History Section */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="bg-green-50 border-b border-green-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-green-700" />
            <h2 className="text-sm font-semibold text-green-800">
              Conversation History
            </h2>
          </div>
          <Badge className="bg-green-100 text-green-800 border border-green-200">
            {history.length}
          </Badge>
        </div>

        {/* Scrollable List */}
        <ScrollArea className="p-3">
          {history.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center justify-center h-[200px] text-green-600 opacity-70"
            >
              <History className="w-12 h-12 mb-2 opacity-40" />
              <p className="text-sm font-medium">No conversation history yet.</p>
              <p className="text-xs mt-1 text-green-500">
                Your conversations will appear here
              </p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {history
                .slice()
                .reverse()
                .slice(0, visibleCount)
                .map((item) => (
                  <div
                    key={item.id}
                    className="cursor-pointer"
                    onClick={() => handleToggleExpand(item.id)}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <HistoryItem
                        item={item}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onRename={onRename}
                        onArchive={onArchive}
                        onExport={onExport}
                        onCopy={onCopy}
                        onSelect={() => onHistorySelect(item)}
                      />
                    </motion.div>
                    {expandedHistoryId === item.id && (
                      <div className="pl-4 text-xs text-gray-500 mt-1 border-l border-gray-300">
                        <p>
                          <strong>Question:</strong> {item.question}
                        </p>
                        <p>
                          <strong>Answer:</strong> {item.answer}
                        </p>
                        <p>
                          <strong>Repo:</strong> {item.repositoryname} |{" "}
                          <strong>Branch:</strong> {item.branchname}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              {visibleCount < history.length && (
                <div className="flex justify-center mt-2">
                  <button
                    onClick={() => setVisibleCount(visibleCount + 5)}
                    className="text-green-600 text-sm hover:underline"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default LeftSidebar;
