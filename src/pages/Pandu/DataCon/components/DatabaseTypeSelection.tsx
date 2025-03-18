// src/pages/Pandu/DataCon/components/DatabaseTypeSelection.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Database, ExternalLink, File, Loader } from 'lucide-react';
import { resetCurrentProject } from './../../../../api/table';

interface DatabaseTypeSelectionProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const DatabaseTypeSelection: React.FC<DatabaseTypeSelectionProps> = ({
  formData,
  updateFormData,
  onNext,
  onBack,
}) => {
  const [selectedSource, setSelectedSource] = useState<string | null>(formData.sourceType || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSourceTypeSelect = (sourceType: string) => {
    setSelectedSource(sourceType);
    updateFormData({ sourceType, databaseType: '' });
  };

  const handleDatabaseTypeSelect = (databaseType: string) => {
    updateFormData({ databaseType });
  };

  const handleContinue = async () => {
    if (formData.sourceType && formData.databaseType) {
      if (formData.sourceType === 'sample-database') {
        setIsLoading(true);
        // Reset the current project on the backend.
        await resetCurrentProject();

        // Prepare payload for SaveDataSource mutation with sample credentials.
        const payload = {
          operationName: "SaveDataSource",
          variables: {
            data: {
              type: "POSTGRES",
              properties: {
                displayName: "Sample_Neon_DB",
                host: "ep-wandering-base-a5gharvz-pooler.us-east-2.aws.neon.tech",
                port: "5432",
                user: "neondb_owner",
                password: "npg_92CKXEBmAQYs",
                database: "neondb",
              },
            },
          },
          query:
            "mutation SaveDataSource($data: DataSourceInput!) { saveDataSource(data: $data) { type properties __typename } }",
        };

        try {
          const res = await fetch("http://localhost:5000/api/codesmell", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const result = await res.json();
          console.log("Sample DB SaveDataSource response:", result);
          if (result.errors || !result.data || !result.data.saveDataSource) {
            alert("Sample database connection failed. Please try again.");
            setIsLoading(false);
            return;
          }
          // Wait 1 second to let the backend create the project.
          await new Promise(resolve => setTimeout(resolve, 1000));
          // Update connection details and mark as connected.
          updateFormData({
            connectionDetails: {
              hostname: "ep-wandering-base-a5gharvz-pooler.us-east-2.aws.neon.tech",
              port: "5432",
              databaseName: "neondb",
              username: "neondb_owner",
              password: "npg_92CKXEBmAQYs",
              useSSL: true,
            },
            isConnected: true,
          });
          // Skip the Connection Details step: advance from step 2 to step 4.
          onNext(); // Step 2 -> Step 3
          onNext(); // Step 3 -> Step 4 (Database Explorer)
        } catch (error) {
          console.error("Error connecting to sample DB:", error);
          alert("Error connecting to sample database");
        } finally {
          setIsLoading(false);
        }
      } else {
        onNext();
      }
    }
  };

  // Data arrays for options.
  const selfHostedDatabases = [
    { id: 'bigquery', name: 'BigQuery', image: 'https://i.imgur.com/LtspHN1.png' },
    { id: 'postgresql', name: 'PostgreSQL', image: 'https://i.imgur.com/JiasqNF.png' },
    { id: 'mysql', name: 'MySQL', image: 'https://i.imgur.com/tKjBUly.png' },
    { id: 'sqlserver', name: 'SQL Server', image: 'https://i.imgur.com/D7AAV19.png' },
    { id: 'clickhouse', name: 'ClickHouse', image: 'https://i.imgur.com/LMjtRYV.png' },
    { id: 'trino', name: 'Trino', image: 'https://i.imgur.com/RyoJU3Z.png' },
    { id: 'snowflake', name: 'Snowflake', image: 'https://i.imgur.com/D1kXdOY.png' },
  ];

  const importedDataSources = [
    { id: 'hubspot', name: 'HubSpot', image: 'https://i.imgur.com/QcHnn3p.png' },
    { id: 'woocommerce', name: 'WooCommerce', image: 'https://i.imgur.com/3Ut9MXU.png' },
    { id: 'stripe', name: 'Stripe', image: 'https://i.imgur.com/Qt9omgR.png' },
    { id: 'ga4', name: 'Google Analytics 4', image: 'https://i.imgur.com/OKwqzJ5.png' },
    { id: 'googleads', name: 'Google Ads', image: 'https://i.imgur.com/E0vaNZo.png' },
    { id: 'airtable', name: 'Airtable', image: 'https://i.imgur.com/Ld9XYJI.png' },
    { id: 'googlesheets', name: 'Google Sheets', image: 'https://i.imgur.com/Ld9XYJI.png' },
  ];

  const sampleDatabase = [
    {
      id: 'sample-database',
      name: 'Sample Database',
      image: 'https://i.imgur.com/8P9f0rV.png',
    },
  ];

  useEffect(() => {
    if (formData.sourceType) {
      setSelectedSource(formData.sourceType);
    }
  }, [formData.sourceType]);

  return (
    <>
      <div className="flex flex-col md:flex-row gap-10 mb-8">
        {/* Left section – Source Type Selection */}
        <div className={`${selectedSource ? 'md:w-1/3' : 'w-full flex justify-center'} transition-all duration-500`}>
          {!selectedSource ? (
            <div className="flex flex-row gap-4 w-full mx-auto">
              <button
                type="button"
                className="flex-1 p-6 border-2 rounded-xl flex items-center gap-4 transition-all border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
                onClick={() => handleSourceTypeSelect('self-hosted')}
              >
                <Database size={48} className="text-gray-500" />
                <span className="font-semibold text-gray-700">Self-hosted Databases</span>
              </button>
              <button
                type="button"
                className="flex-1 p-6 border-2 rounded-xl flex items-center gap-4 transition-all border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
                onClick={() => handleSourceTypeSelect('imported')}
              >
                <ExternalLink size={48} className="text-gray-500" />
                <span className="font-semibold text-gray-700">Imported Data Sources</span>
              </button>
              <button
                type="button"
                className="flex-1 p-6 border-2 rounded-xl flex items-center gap-4 transition-all border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
                onClick={() => handleSourceTypeSelect('sample-database')}
              >
                <File size={48} className="text-gray-500" />
                <span className="font-semibold text-gray-700">Sample Database</span>
              </button>
            </div>
          ) : (
            <div className="animate-fadeIn">
              <h3 className="text-lg font-semibold mb-4 text-purple-700">Source Type</h3>
              <button
                type="button"
                className="w-full p-4 border-2 rounded-xl flex items-center gap-3 transition-all border-purple-600 bg-purple-50"
                onClick={() => setSelectedSource(null)}
              >
                {selectedSource === 'self-hosted' ? (
                  <Database size={24} className="text-purple-600" />
                ) : (
                  <ExternalLink size={24} className="text-purple-600" />
                )}
                <span className="font-semibold text-gray-700">
                  {selectedSource === 'self-hosted'
                    ? 'Self-hosted Databases'
                    : selectedSource === 'imported'
                    ? 'Imported Data Sources'
                    : 'Sample Database'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Right section – Database Options */}
        {selectedSource && (
          <div className="md:w-2/3 animate-fadeIn">
            <h3 className="text-xl font-semibold mb-4 text-purple-800">
              {selectedSource === 'self-hosted'
                ? 'Select Database'
                : selectedSource === 'imported'
                ? 'Select Data Source'
                : 'Select Sample Database'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {(selectedSource === 'self-hosted'
                ? selfHostedDatabases
                : selectedSource === 'imported'
                ? importedDataSources
                : sampleDatabase
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center transition-all transform hover:scale-105 hover:shadow-lg ${
                    formData.databaseType === item.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => handleDatabaseTypeSelect(item.id)}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-12 object-contain mb-3"
                    loading="lazy"
                  />
                  <span className="font-medium text-gray-700">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 sticky bottom-0 bg-white py-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="font-semibold text-gray-700">Back</span>
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!formData.sourceType || !formData.databaseType || isLoading}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
            formData.sourceType && formData.databaseType && !isLoading
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <Loader size={18} className="animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <span className="font-semibold">Next</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </>
  );
};

export default DatabaseTypeSelection;
