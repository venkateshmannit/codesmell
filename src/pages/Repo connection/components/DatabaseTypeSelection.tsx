import React from 'react';
import { ArrowLeft, ArrowRight, Database, ExternalLink } from 'lucide-react';

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
  const handleSourceTypeSelect = (sourceType: string) => {
    updateFormData({ sourceType, databaseType: '' });
  };

  const handleDatabaseTypeSelect = (databaseType: string) => {
    updateFormData({ databaseType });
  };

  const handleContinue = () => {
    if (formData.sourceType && formData.databaseType) {
      onNext();
    }
  };

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

  return (
    <div
    className="overflow-y-auto"
    style={{ maxHeight: '400px', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
  >
    <div className="animate-fadeIn bg-gray-50 p-8 rounded-2xl shadow-lg ">
      {/* Heading placed outside the scrollable content */}
      <h2 className="text-2xl font-bold mb-4 text-purple-800">Select Database Type</h2>

      {/* Scrollable container for the rest of the content */}
     
        {/* Inline style to hide scrollbar for WebKit */}
        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        <div className="mb-8">
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              className={`flex-1 p-6 border-2 rounded-xl flex flex-col items-center gap-3 transition-all ${
                formData.sourceType === 'self-hosted'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
              }`}
              onClick={() => handleSourceTypeSelect('self-hosted')}
            >
              <Database
                size={36}
                className={formData.sourceType === 'self-hosted' ? 'text-purple-600' : 'text-gray-500'}
              />
              <span className="font-semibold text-gray-700">Self-hosted Databases</span>
            </button>

            <button
              type="button"
              className={`flex-1 p-6 border-2 rounded-xl flex flex-col items-center gap-3 transition-all ${
                formData.sourceType === 'imported'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
              }`}
              onClick={() => handleSourceTypeSelect('imported')}
            >
              <ExternalLink
                size={36}
                className={formData.sourceType === 'imported' ? 'text-purple-600' : 'text-gray-500'}
              />
              <span className="font-semibold text-gray-700">Imported Data Sources</span>
            </button>
          </div>
        </div>

        {formData.sourceType === 'self-hosted' && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-purple-800">Select Database</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {selfHostedDatabases.map((db) => (
                <button
                  key={db.id}
                  type="button"
                  className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center transition-all transform hover:scale-105 hover:shadow-lg ${
                    formData.databaseType === db.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => handleDatabaseTypeSelect(db.id)}
                >
                  <img
                    src={db.image}
                    alt={db.name}
                    className="h-14 object-contain mb-4"
                    loading="lazy"
                  />
                  <span className="font-medium text-gray-700">{db.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {formData.sourceType === 'imported' && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-purple-800">Select Data Source</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {importedDataSources.map((source) => (
                <button
                  key={source.id}
                  type="button"
                  className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center transition-all transform hover:scale-105 hover:shadow-lg ${
                    formData.databaseType === source.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => handleDatabaseTypeSelect(source.id)}
                >
                  <img
                    src={source.image}
                    alt={source.name}
                    className="h-14 object-contain mb-4"
                    loading="lazy"
                  />
                  <span className="font-medium text-gray-700">{source.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold text-gray-700">Back</span>
          </button>

          <button
            type="button"
            onClick={handleContinue}
            disabled={!formData.sourceType || !formData.databaseType}
            className={`flex items-center gap-2 px-8 py-3 rounded-lg transition-colors ${
              formData.sourceType && formData.databaseType
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span className="font-semibold">Next</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatabaseTypeSelection;
