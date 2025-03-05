import React, { useState } from "react";
import { Folder, FolderOpen, FileText } from "lucide-react";

const FileTree = ({ node }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (node.type === "file") {
    return (
      <div className="pl-6 flex items-center space-x-2 hover:bg-purple-50 p-1 rounded-md">
        <FileText className="w-4 h-4 text-purple-600" />
        <span className="text-sm text-purple-800">{node.name}</span>
      </div>
    );
  }

  return (
    <div className="pl-4">
      <div
        className="flex items-center space-x-2 cursor-pointer p-1 rounded-md hover:bg-purple-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <FolderOpen className="w-5 h-5 text-purple-600" />
        ) : (
          <Folder className="w-5 h-5 text-purple-600" />
        )}
        <span className="text-sm font-medium text-purple-800">{node.name}</span>
      </div>
      {isOpen && node.children && (
        <div className="ml-4 border-l border-purple-200">
          {node.children.map((child, index) => (
            <FileTree key={index} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileTree;
