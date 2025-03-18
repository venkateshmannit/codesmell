import React, { useState } from "react";
import { Folder, FolderOpen, FileText, ChevronRight, ChevronDown } from 'lucide-react';

interface FileNode {
  type: "folder" | "file";
  name: string;
  children?: FileNode[];
}

interface FileTreeProps {
  node: FileNode;
}

const FileTree: React.FC<FileTreeProps> = ({ node }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (node.type === "file") {
    return (
      <div className="pl-6 flex items-center space-x-2 hover:bg-green-100 p-2 rounded-md transition-colors duration-200 group">
        <div className="bg-green-50 p-1 rounded group-hover:bg-green-100 transition-colors">
          <FileText className="w-3.5 h-3.5 text-green-600" />
        </div>
        <span className="text-sm text-green-800">{node.name}</span>
      </div>
    );
  }

  return (
    <div className="pl-2">
      <div
        className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-green-100 transition-colors duration-200 group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="text-green-600">
          {isOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
        <div className="bg-green-50 p-1 rounded group-hover:bg-green-100 transition-colors">
          {isOpen ? (
            <FolderOpen className="w-4 h-4 text-green-600" />
          ) : (
            <Folder className="w-4 h-4 text-green-600" />
          )}
        </div>
        <span className="text-sm font-medium text-green-800">{node.name}</span>
      </div>
      
      {isOpen && node.children && (
        <div className="ml-6 border-l border-green-200 pl-2 py-1">
          {node.children.map((child, index) => (
            <FileTree key={index} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileTree;
