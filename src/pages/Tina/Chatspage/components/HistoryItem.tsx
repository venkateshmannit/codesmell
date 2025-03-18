import React, { useState } from "react";
import { Clock, MoreHorizontal, Edit3, ArchiveIcon, Trash2, Download, MessageSquare } from "lucide-react";

interface HistoryItemProps {
  item: { id: number; question: string; repositoryname: string; branchname: string };
  onEdit: (id: number, question: string) => void;
  onDelete: (id: number) => void;
  onRename: (id: number) => void;
  onArchive: (id: number) => void;
  onExport: (id: number) => void;
  onCopy: (question: string) => void;
  onSelect?: () => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
  item,
  onEdit,
  onDelete,
  onRename,
  onArchive,
  onExport,
  onCopy,
  onSelect,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(item.question);
  const [showOptions, setShowOptions] = useState(false);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setShowOptions(false);
  };

  const handleSaveEdit = () => {
    onEdit(item.id, editedText);
    setIsEditing(false);
  };

  return (
    <div className="relative group cursor-pointer" onClick={onSelect}>
      <div className="flex items-center justify-between p-3 border border-green-200 rounded-lg hover:bg-green-50 transition-all duration-200 shadow-sm hover:shadow">
        <div className="flex items-start space-x-2 flex-1 min-w-0">
          <MessageSquare className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                className="text-green-700 text-sm border border-green-300 rounded p-1.5 w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                autoFocus
              />
            ) : (
              <p className="text-green-700 text-sm truncate">{item.question}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            className="p-1.5 rounded-full hover:bg-green-100 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => { e.stopPropagation(); onCopy(item.question); }}
            title="Copy conversation to input"
          >
            <Clock className="w-4 h-4" />
          </button>
          <div className="relative">
            <button
              className="p-1.5 rounded-full hover:bg-green-100 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }}
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showOptions && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-green-200 rounded-lg shadow-lg z-10 py-1 overflow-hidden">
                <button
                  onClick={handleEditClick}
                  className="w-full text-left px-3 py-2 hover:bg-green-50 flex items-center space-x-2 text-sm transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-green-600" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onRename(item.id); setShowOptions(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-green-50 flex items-center space-x-2 text-sm transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-green-600" />
                  <span>Rename</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onArchive(item.id); setShowOptions(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-green-50 flex items-center space-x-2 text-sm transition-colors"
                >
                  <ArchiveIcon className="w-4 h-4 text-green-600" />
                  <span>Archive</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id); setShowOptions(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-green-50 flex items-center space-x-2 text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-green-600" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onExport(item.id); setShowOptions(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-green-50 flex items-center space-x-2 text-sm transition-colors"
                >
                  <Download className="w-4 h-4 text-green-600" />
                  <span>Export PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryItem;
