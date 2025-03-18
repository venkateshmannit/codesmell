import React from "react";
import ReactMarkdown from "react-markdown";

interface ReadmeModalProps {
  readmeContent: string;
  onClose: () => void;
}

const ReadmeModal: React.FC<ReadmeModalProps> = ({ readmeContent, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-lg p-6 z-50 max-w-3xl w-full mx-4">
        <h2 className="text-xl font-bold mb-4">README.md</h2>
        <div className="prose prose-sm max-h-96 overflow-y-auto">
          <ReactMarkdown>{readmeContent}</ReactMarkdown>
        </div>
        <button
          className="mt-4 bg-teal-600 text-white px-4 py-2 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ReadmeModal;
