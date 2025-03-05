import React from "react";
import { ChevronLeft } from "lucide-react";
import FileTree from "./FileTree";
import HistoryItem from "./HistoryItem";

const LeftSidebar = ({
  repo,
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
        <div className="flex items-center justify-between p-4 border-b border-purple-200">
          <div>
            <h1 className="text-xl font-bold text-purple-800">{repo.name}</h1>
            <p className="text-sm text-purple-600">Branch: {repo.branch}</p>
          </div>
          <button
            className="p-1 rounded hover:bg-purple-50"
            onClick={onToggle}
            title="Close Sidebar"
          >
            <ChevronLeft className="w-5 h-5 text-purple-600" />
          </button>
        </div>
        <div className="px-4 py-2">
          <span className="bg-pink-200 text-pink-800 text-xs font-semibold px-2 py-1 rounded">
            Repository
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
          {repo.tree.map((node, index) => (
            <FileTree key={index} node={node} />
          ))}
        </div>
      </div>
      {/* Bottom Container for History */}
      <div className="h-1/2 border-t border-purple-200 flex flex-col">
        <div className="px-4 py-2">
          <h2 className="text-lg font-semibold text-purple-800 mb-2">
            Question History
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
          {history.length === 0 ? (
            <p className="text-purple-500 text-sm">No history yet.</p>
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
