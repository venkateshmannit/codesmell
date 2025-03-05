// src/pages/ChatPage/components/LeftSidebar.tsx
import React from "react";
import { ChevronLeft } from "lucide-react";
import FileTree from "./FileTree";
import HistoryItem from "./HistoryItem";

interface LeftSidebarProps {
  repo: any;
  fileTree: any[];
  history: any[];
  onCopy: (text: string) => void;
  onToggle: () => void;
  onEdit: (id: number, newText: string) => void;
  onDelete: (id: number) => void;
  onRename: (id: number) => void;
  onArchive: (id: number) => void;
  onExport: (id: number) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  repo,
  fileTree,
  history,
  onCopy,
  onToggle,
  onEdit,
  onDelete,
  onRename,
  onArchive,
  onExport,
}) => {
  return (
    <div className="h-full flex flex-col bg-white border-r shadow-md mt-16">
      {/* Top Container */}
      <div className="h-1/2 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-green-200">
          <div>
            <h1 className="text-xl font-bold text-green-800">{repo.name}</h1>
            <p className="text-sm text-green-600">Branch: {repo.branch}</p>
          </div>
          <button
            className="p-1 rounded hover:bg-green-50"
            onClick={onToggle}
            title="Close Sidebar"
          >
            <ChevronLeft className="w-5 h-5 text-green-600" />
          </button>
        </div>
        <div className="px-4 py-2">
          <span className="bg-teal-200 text-teal-800 text-xs font-semibold px-2 py-1 rounded">
            Repository File Tree
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
          {fileTree && fileTree.length > 0 ? (
            fileTree.map((node, index) => <FileTree key={index} node={node} />)
          ) : (
            <p className="text-green-500 text-sm">No file tree data available.</p>
          )}
        </div>
      </div>
      {/* Bottom Container for History */}
      <div className="h-1/2 border-t border-green-200 flex flex-col">
        <div className="px-4 py-2">
          <h2 className="text-lg font-semibold text-green-800 mb-2">
            Question History
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
          {history.length === 0 ? (
            <p className="text-green-500 text-sm">No history yet.</p>
          ) : (
            history.map((item) => (
              <HistoryItem
                key={item.id}
                item={item}
                onEdit={onEdit}
                onDelete={onDelete}
                onRename={onRename}
                onArchive={onArchive}
                onExport={onExport}
                onCopy={onCopy}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
