import React, { useState } from "react";
import {
  Clock,
  MoreHorizontal,
  Edit3,
  Archive as ArchiveIcon,
  Trash2,
  Download,
} from "lucide-react";

const HistoryItem = ({
  item,
  onEdit,
  onDelete,
  onRename,
  onArchive,
  onExport,
  onCopy,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(item.text);
  const [showOptions, setShowOptions] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
    setShowOptions(false);
  };

  const handleSaveEdit = () => {
    onEdit(item.id, editedText);
    setIsEditing(false);
  };

  return (
    <div className="relative flex items-center justify-between p-2 border border-purple-200 rounded-md hover:bg-purple-50">
      <div className="flex-1">
        {isEditing ? (
          <input
            type="text"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            onBlur={handleSaveEdit}
            className="text-purple-700 text-sm border border-purple-300 rounded p-1 w-full"
            autoFocus
          />
        ) : (
          <span className="text-purple-700 text-sm">{item.text}</span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Clock
          className="w-4 h-4 text-purple-600 cursor-pointer"
          onClick={() => onCopy(item.text)}
          title="Copy question to input"
        />
        <div
          className="relative"
          onMouseEnter={() => setShowOptions(true)}
          onMouseLeave={() => setShowOptions(false)}
        >
          <MoreHorizontal className="w-4 h-4 text-purple-600 cursor-pointer" />
          {showOptions && (
            <div className="absolute right-0 mt-1 w-36 bg-white border border-purple-200 rounded shadow-lg z-10">
              <button
                onClick={handleEditClick}
                className="w-full text-left px-2 py-1 hover:bg-purple-50 flex items-center space-x-1"
              >
                <Edit3 className="w-4 h-4 text-purple-600" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  onRename(item.id);
                  setShowOptions(false);
                }}
                className="w-full text-left px-2 py-1 hover:bg-purple-50 flex items-center space-x-1"
              >
                <Edit3 className="w-4 h-4 text-purple-600" />
                <span>Rename</span>
              </button>
              <button
                onClick={() => {
                  onArchive(item.id);
                  setShowOptions(false);
                }}
                className="w-full text-left px-2 py-1 hover:bg-purple-50 flex items-center space-x-1"
              >
                <ArchiveIcon className="w-4 h-4 text-purple-600" />
                <span>Archive</span>
              </button>
              <button
                onClick={() => {
                  onDelete(item.id);
                  setShowOptions(false);
                }}
                className="w-full text-left px-2 py-1 hover:bg-purple-50 flex items-center space-x-1"
              >
                <Trash2 className="w-4 h-4 text-purple-600" />
                <span>Delete</span>
              </button>
              <button
                onClick={() => {
                  onExport(item.id);
                  setShowOptions(false);
                }}
                className="w-full text-left px-2 py-1 hover:bg-purple-50 flex items-center space-x-1"
              >
                <Download className="w-4 h-4 text-purple-600" />
                <span>Export PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryItem;
