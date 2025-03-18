// src/pages/Pandu/modeling/components/Sidebar.tsx
import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  RotateCw,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

interface SidebarProps {
  refreshSignal?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ refreshSignal }) => {
  const [models, setModels] = useState<any[]>([]);
  const [expandedModels, setExpandedModels] = useState<Record<string, boolean>>({});
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Instead of calling API, load models from localStorage.
  const fetchModelsFromMemory = () => {
    setLoading(true);
    const storedTableData = localStorage.getItem("tableData");
    if (storedTableData) {
      const tables = JSON.parse(storedTableData);
      setModels(tables);
      setExpandedModels(
        tables.reduce((acc: any, table: any) => {
          acc[table.name] = false;
          return acc;
        }, {})
      );
      // Simulate fetching history logs (or read from memory if available)
      const mockHistory = [
        {
          dbName: "PostgresDB",
          user: "Admin",
          time: "10:30 AM",
          tables: ["Users", "Orders", "Products"],
        },
        {
          dbName: "MySQL_DB",
          user: "Guest",
          time: "11:15 AM",
          tables: ["Customers", "Sales"],
        },
      ];
      setHistory(mockHistory);
    } else {
      toast.error("No table data found in memory.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchModelsFromMemory();
  }, [refreshSignal]);

  const toggleModel = (model: string) => {
    setExpandedModels((prev) => ({
      ...prev,
      [model]: !prev[model],
    }));
  };

  return (
    <div className="w-72 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full bg-white dark:bg-gray-900 shadow-md">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center mt-16">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200">
          Models ({models.length})
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchModelsFromMemory}
            className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <RotateCw size={18} />
          </button>
        </div>
      </div>

      {/* Models List */}
      <div className="overflow-auto flex-1 py-2">
        {loading ? (
          <div className="animate-pulse px-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-md my-2"
              ></div>
            ))}
          </div>
        ) : (
          models.map((model) => (
            <div key={model.name} className="mb-1">
              <div
                className={`flex items-center px-4 py-2 cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
                  expandedModels[model.name] ? "bg-gray-50 dark:bg-gray-800" : ""
                }`}
                onClick={() => toggleModel(model.name)}
              >
                <span className="mr-2 text-gray-500">
                  {expandedModels[model.name] ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {model.name}
                </span>
              </div>
              {expandedModels[model.name] && (
                <div className="pl-12 pr-4 py-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                  {model.columns?.length > 0 ? (
                    <ul className="list-disc space-y-1">
                      {model.columns.map((col: any) => (
                        <li key={col.name}>{col.name}</li>
                      ))}
                    </ul>
                  ) : (
                    "No fields configured"
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* History Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-gray-800 dark:text-gray-200 font-semibold text-sm flex items-center">
          <Clock size={18} className="mr-2" /> History
        </h3>
        <div className="mt-2 space-y-2">
          {history.map((item, index) => (
            <div
              key={index}
              className="relative p-3 bg-gray-100 dark:bg-gray-800 rounded-md cursor-pointer transition-all hover:shadow-lg hover:scale-105 duration-200"
            >
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                <span className="text-gray-500 dark:text-gray-400">DB:</span> {item.dbName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="text-gray-600 dark:text-gray-300">User:</span> {item.user}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="text-gray-600 dark:text-gray-300">Time:</span> {item.time}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
