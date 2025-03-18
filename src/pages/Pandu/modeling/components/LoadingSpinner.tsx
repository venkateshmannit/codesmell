// src/components/LoadingSpinner.tsx
import React from "react";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold text-slate-700">Loading tables...</p>
    </div>
  );
};

export default LoadingSpinner;
