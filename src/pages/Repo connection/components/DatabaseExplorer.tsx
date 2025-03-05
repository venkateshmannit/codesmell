import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Database, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DatabaseExplorerProps {
  formData: any;
  updateFormData: (data: any) => void;
  onBack: () => void;
  onFinish: (e: React.FormEvent) => void;
}

const DatabaseExplorer: React.FC<DatabaseExplorerProps> = ({
  formData,
  updateFormData,
  onBack,
  onFinish,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTables = () => {
      setIsLoading(true);
      setTimeout(() => {
        const mockTables = [
          'users',
          'customers',
          'orders',
          'products',
          'categories',
          'inventory',
          'transactions',
          'payments',
          'shipping',
          'analytics',
          'logs',
          'events',
        ];
        setAvailableTables(mockTables);
        if (!formData.selectedTables || formData.selectedTables.length === 0) {
          updateFormData({ selectedTables: mockTables });
        }
        setIsLoading(false);
      }, 1500);
    };
    loadTables();
  }, [formData.selectedTables, updateFormData]);

  const handleTableToggle = (tableName: string) => {
    const updatedTables = formData.selectedTables.includes(tableName)
      ? formData.selectedTables.filter((t: string) => t !== tableName)
      : [...formData.selectedTables, tableName];
    updateFormData({ selectedTables: updatedTables });
  };

  const filteredTables = availableTables.filter(table =>
    table.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getConnectionDisplayName = () => {
    const dbType =
      formData.databaseType.charAt(0).toUpperCase() +
      formData.databaseType.slice(1);
    return `${dbType} - ${formData.connectionDetails.databaseName || formData.connectionDetails.accountId}`;
  };

  const handleFinish = (e: React.FormEvent) => {
    onFinish(e);
    navigate('/panduchat');
  };

  return (
    <div
    className="overflow-y-auto"
    style={{ maxHeight: '400px', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
  >
    
    <div className="animate-fadeIn bg-white p-8 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-8 text-gray-800">Database Explorer</h2>

      <div className="mb-8 p-4 bg-purple-50 border border-purple-100 rounded-lg">
        <h3 className="text-md font-medium text-purple-800 mb-2">Connected Database</h3>
        <div className="flex items-center gap-2 text-purple-700">
          <Database size={20} />
          <span className="font-semibold">{getConnectionDisplayName()}</span>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2 sm:mb-0">Available Tables</h3>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tables..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 transition-colors"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {filteredTables.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No tables found matching your search.
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {filteredTables.map((table) => (
                  <div
                    key={table}
                    className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleTableToggle(table)}
                  >
                    <span className="font-medium text-gray-700">{table}</span>
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                        formData.selectedTables.includes(table)
                          ? 'bg-purple-600'
                          : 'border border-gray-300'
                      }`}
                    >
                      {formData.selectedTables.includes(table) && (
                        <CheckCircle size={16} className="text-white" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-2 text-sm text-gray-500">
          {formData.selectedTables.length} tables selected
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors w-full sm:w-auto"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleFinish}
          className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors w-full sm:w-auto"
        >
          Finish Setup
        </button>
      </div>
    </div>
    </div>
  );
};

export default DatabaseExplorer;
