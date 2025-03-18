"use client";
import React from "react";
import { MessageSquare } from "lucide-react";

interface Conversation {
  id: string;
  messages: any[];
  lastUpdated: number;
  projectname?: string;
  questionPreview?: string;
}

interface HistoryItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (conversation: Conversation) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ conversation, isActive, onSelect }) => {
  const preview =
    conversation.questionPreview ||
    (conversation.messages.length > 0
      ? conversation.messages[0].content || conversation.messages[0].answerText || "Chat"
      : "Empty Chat");
  const date = new Date(conversation.lastUpdated).toLocaleString();
  return (
    <div
      className={`p-2 border rounded-lg cursor-pointer hover:bg-purple-50 transition-colors ${
        isActive ? "border-purple-600" : "border-purple-200"
      }`}
      onClick={() => onSelect(conversation)}
    >
      <div className="flex items-center justify-between">
        <div className="text-purple-700 font-semibold truncate">
          {conversation.projectname || "Project"}
        </div>
        <div className="text-xs text-gray-500">{date}</div>
      </div>
      <div className="text-sm text-gray-700 mt-1 truncate">{preview}</div>
    </div>
  );
};

export default HistoryItem;
