import React, { useState } from "react";
import { ChevronDown, ChevronRight, RotateCw, Plus } from "react-feather";

const Sidebar: React.FC = () => {
  const [expandedModels, setExpandedModels] = useState<Record<string, boolean>>({
    customers: false,
    "order items": false,
    orders: false,
    "order payments": false,
    products: false,
    "order reviews": false,
    geolocation: false,
    sellers: false,
    "product category translation": false,
  });

  const toggleModel = (model: string) => {
    setExpandedModels((prev) => ({
      ...prev,
      [model]: !prev[model],
    }));
  };

  return (
    <div className="w-64 border-r flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center">
          <h2 className="font-medium">Models</h2>
          <span className="text-gray-500 ml-1 text-xs">(9)</span>
        </div>
        <div className="flex items-center">
          <button className="mr-2 text-gray-500 hover:text-gray-700">
            <RotateCw size={16} />
          </button>
          <button className="flex items-center text-gray-500 hover:text-gray-700 border rounded px-2 py-1">
            <Plus size={16} />
            <span className="ml-1">New</span>
          </button>
        </div>
      </div>
      <div className="overflow-auto flex-1">
        {Object.keys(expandedModels).map((model) => (
          <div key={model} className="border-b">
            <div
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleModel(model)}
            >
              <span className="mr-1">
                {expandedModels[model] ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </span>
              <span className="w-5 h-5 flex items-center justify-center mr-2">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
              </span>
              <span>{model}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Additional sections (Credit usage, Learning, etc.) */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              className="mr-2"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Credit usage</span>
          </div>
          <button className="text-blue-600 text-xs">Manage credits</button>
        </div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">95</span>
          <span className="text-xs text-gray-500">credits left (95%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "95%" }}></div>
        </div>
      </div>
      <div className="border-t p-4">
        {["Settings", "Get support", "About this dataset"].map((item, index) => (
          <div
            key={index}
            className="flex items-center py-2 text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              className="mr-2"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            >
              {index === 0 && <circle cx="12" cy="12" r="3"></circle>}
              {index === 0 && (
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              )}
              {index === 1 && <circle cx="12" cy="12" r="10"></circle>}
              {index === 1 && <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>}
              {index === 1 && <line x1="12" y1="17" x2="12.01" y2="17"></line>}
              {index === 2 && <circle cx="12" cy="12" r="10"></circle>}
              {index === 2 && <line x1="12" y1="16" x2="12" y2="12"></line>}
              {index === 2 && <line x1="12" y1="8" x2="12.01" y2="8"></line>}
            </svg>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
