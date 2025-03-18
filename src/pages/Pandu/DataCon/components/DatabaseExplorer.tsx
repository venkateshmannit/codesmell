// src/pages/Pandu/DataCon/components/DatabaseExplorer.tsx
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { listTableDetails, listSampleTables } from './../../../../api/table';
import { Loader } from "lucide-react";

interface DatabaseExplorerProps {
  formData: any;
  updateFormData: (data: any) => void;
  onBack: () => void;
  onFinish: () => void;
}

const DatabaseExplorer: React.FC<DatabaseExplorerProps> = ({
  formData,
  updateFormData,
  onBack,
  onFinish,
}) => {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [finishLoading, setFinishLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchTables = async () => {
      setLoading(true);
      try {
        let result;
        if (formData.sourceType === 'sample-database') {
          result = await listSampleTables();
        } else {
          result = await listTableDetails();
        }
        console.log("List Tables API Response:", result);
        if (result && result.data && result.data.listDataSourceTables) {
          if (result.data.listDataSourceTables.length === 0) {
            toast.error("No tables found. Please go back and enter a different data connection.");
            setTables([]);
            return;
          }
          setTables(result.data.listDataSourceTables);
          // Save full table data in localStorage for later use.
          localStorage.setItem("tableData", JSON.stringify(result.data.listDataSourceTables));
        } else {
          toast.error("Failed to fetch tables");
        }
      } catch (error) {
        console.error("Error fetching tables:", error);
        toast.error("Error fetching tables");
      } finally {
        setLoading(false);
      }
    };

    if (formData.isConnected) {
      fetchTables();
    }
  }, [formData.isConnected, formData.sourceType]);

  const toggleTableSelection = (tableName: string) => {
    const currentSelection = formData.selectedTables || [];
    if (currentSelection.includes(tableName)) {
      updateFormData({
        selectedTables: currentSelection.filter((t: string) => t !== tableName),
      });
    } else {
      updateFormData({ selectedTables: [...currentSelection, tableName] });
    }
  };

  const filteredTables = tables.filter((table) =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = () => {
    const filteredTableNames = filteredTables.map((table: any) => table.name);
    const currentSelection = formData.selectedTables || [];
    const allSelected = filteredTableNames.every((tableName) =>
      currentSelection.includes(tableName)
    );
    if (allSelected) {
      updateFormData({
        selectedTables: currentSelection.filter(
          (tableName: string) => !filteredTableNames.includes(tableName)
        ),
      });
    } else {
      updateFormData({
        selectedTables: Array.from(new Set([...currentSelection, ...filteredTableNames])),
      });
    }
  };

  const handleFinish = async () => {
    if (!formData.selectedTables || formData.selectedTables.length === 0) {
      toast.error("Please select at least one table to proceed.");
      return;
    }
    // Set finish loading state to show overlay animation.
    setFinishLoading(true);
    try {
      // Simulate processing delay (e.g. saving context or download action).
      await new Promise(resolve => setTimeout(resolve, 8000));
      onFinish(); // Expected to navigate to the next page (Modeling)
    } catch (error) {
      toast.error("Error finishing setup. Please try again.");
    } finally {
      setFinishLoading(false);
    }
  };

  const areAllFilteredSelected = filteredTables.every((table: any) =>
    (formData.selectedTables || []).includes(table.name)
  );

  return (
    <div className="p-2 relative">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Select Tables</h2>
      {/* Search Input */}
      <div className="flex items-center mb-4">
        <input
          type="text"
          placeholder="Search tables..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>

      {loading ? (
        <div className="animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            ))}
          </div>
          <p className="text-center text-gray-500">Loading tables...</p>
        </div>
      ) : (
        <>
          {tables.length === 0 ? (
            <div className="p-4 text-center text-red-600 font-semibold animate-pulse">
              No tables found. Please go back and enter a different data connection.
            </div>
          ) : (
            <div className="overflow-y-auto border rounded-lg" style={{ maxHeight: '180px' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                {filteredTables.map((table: any) => (
                  <div
                    key={table.name}
                    onClick={() => toggleTableSelection(table.name)}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      (formData.selectedTables || []).includes(table.name)
                        ? "bg-purple-50 border-purple-600"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={(formData.selectedTables || []).includes(table.name)}
                      readOnly
                      className="mr-2 w-5 h-5"
                    />
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {table.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow hover:bg-gray-300 transition-colors"
        >
          Back
        </button>
        <div className="flex gap-4">
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:opacity-90 transition-colors"
          >
            {areAllFilteredSelected ? "Clear All" : "Select All"}
          </button>
          <button
            onClick={handleFinish}
            disabled={finishLoading || (formData.selectedTables?.length ?? 0) === 0}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow transition-colors hover:bg-purple-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {finishLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Finishing Setup...</span>
              </>
            ) : (
              <span>Finish Setup</span>
            )}
          </button>
        </div>
      </div>

      {/* Professional Full-Page Loading Overlay */}
      {finishLoading && (
        <>
          <style>{`
            @keyframes fadeInScale {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
          `}</style>
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-70 animate-[fadeInScale_0.5s_ease-out]">
            <Loader className="w-16 h-16 animate-spin text-white" />
            <p className="mt-4 text-white text-xl font-bold animate-pulse">
              Finishing Setup...
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default DatabaseExplorer;
