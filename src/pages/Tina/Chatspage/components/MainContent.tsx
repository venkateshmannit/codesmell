import React from "react";
import ReactMarkdown from "react-markdown";
import {
  MessageSquare,
  Check,
  CopyIcon,
  Download,
  Loader2,
  Send,
} from "lucide-react";
import { Folder, GitBranch } from "lucide-react";

interface MainContentProps {
  messages: { role: string; text: string }[];
  isNewChat: boolean;
  suggestions: { title: string; text: string }[];
  selectedRepo: { name: string; branch: string; tree?: any[] };
  handleSuggestionClick: (text: string) => void;
  handleCopyAllHistory: () => void;
  copySuccess: boolean;
  handleExportFullHistory: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  inputText: string;
  isLoading: boolean;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleAsk: () => void;
}

const MainContent: React.FC<MainContentProps> = ({
  messages,
  isNewChat,
  suggestions,
  selectedRepo,
  handleSuggestionClick,
  handleCopyAllHistory,
  copySuccess,
  handleExportFullHistory,
  messagesEndRef,
  inputRef,
  inputText,
  isLoading,
  handleKeyDown,
  handleAsk,
}) => {
  return (
    <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto pt-4 mt-16 px-4">
      {messages.length === 0 && isNewChat ? (
        <div className="text-center mb-6">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
            <MessageSquare className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-green-800 text-xl font-semibold mt-2">
            Explore Repository Insights
          </h2>
          <p className="text-green-600 mt-1">
            Ask your repository questions below.
          </p>
          <div className="inline-flex items-center mt-2 bg-green-100 px-3 py-1.5 rounded-full">
            <Folder className="w-4 h-4 text-green-600 mr-1.5" />
            <span className="text-sm text-green-700 font-medium">
              {selectedRepo.name}
            </span>
            <span className="mx-1.5 text-green-500">•</span>
            <GitBranch className="w-3.5 h-3.5 text-green-600 mr-1" />
            <span className="text-sm text-green-700">
              {selectedRepo.branch || "main"}
            </span>
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
              </div>
            ))}
          </div>
        </div>
      ) : messages.length > 0 ? (
        <div id="conversation-container" className="flex-1 overflow-y-auto p-4 hide-scrollbar bg-white rounded-lg shadow-sm border border-green-100">
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
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 message-appear ${
                msg.role === "user" ? "flex justify-end" : "flex justify-start"
              }`}
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
                      a: ({ node, ...props }) => (
                        <a className="text-teal-600 underline" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc pl-5 my-2" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal pl-5 my-2" {...props} />
                      ),
                      li: ({ node, ...props }) => <li className="my-1" {...props} />,
                      code: ({
                        node,
                        inline,
                        className,
                        ...props
                      }: {
                        node?: any;
                        inline?: boolean;
                        className?: string;
                        [key: string]: any;
                      }) =>
                        inline ? (
                          <code
                            className={`bg-green-50 px-1 py-0.5 rounded text-green-800 text-sm ${className || ""}`}
                            {...props}
                          />
                        ) : (
                          <code
                            className={`block bg-green-50 p-2 rounded text-green-800 text-sm my-2 overflow-x-auto ${className || ""}`}
                            {...props}
                          />
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
          ))}
          <div ref={messagesEndRef} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-green-600">
            No conversation selected. Click a history item on the left.
          </p>
        </div>
      )}
      {messages.length > 0 && (
        <div className="suggestion-popup flex flex-wrap justify-center gap-4 mb-4">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion.text)}
              className="p-2 border border-green-200 rounded-lg bg-white shadow-sm text-sm cursor-pointer hover:bg-green-50 transition transform hover:scale-105"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1.5 inline" />
              {suggestion.text}
            </div>
          ))}
        </div>
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
            className={`bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 transition-colors flex items-center justify-center ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
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
        <p className="text-xs text-green-600 mt-2 text-center">
          Press Enter to send your message
        </p>
      </div>
    </main>
  );
};

export default MainContent;
