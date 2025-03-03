import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Lock, Loader, CheckCircle, AlertCircle } from 'lucide-react';

interface ConnectionDetailsFormProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const ConnectionDetailsForm: React.FC<ConnectionDetailsFormProps> = ({
  formData,
  updateFormData,
  onNext,
  onBack,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    updateFormData({
      connectionDetails: {
        ...formData.connectionDetails,
        [name]: type === 'checkbox' ? checked : value,
      },
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.sourceType === 'self-hosted') {
      if (!formData.connectionDetails.hostname) newErrors.hostname = 'Hostname is required';
      if (!formData.connectionDetails.port) newErrors.port = 'Port is required';
      if (!formData.connectionDetails.databaseName) newErrors.databaseName = 'Database name is required';
      if (!formData.connectionDetails.username) newErrors.username = 'Username is required';
      if (!formData.connectionDetails.password) newErrors.password = 'Password is required';
    } else {
      if (!formData.connectionDetails.apiKey) newErrors.apiKey = 'API Key is required';
      if (!formData.connectionDetails.accountId) newErrors.accountId = 'Account ID is required';
      if (formData.databaseType === 'googlesheets' && !formData.connectionDetails.datasetId) {
        newErrors.datasetId = 'Dataset ID is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const testConnection = () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setConnectionStatus('idle');
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Simulate success (in a real app, this would be based on the API response)
      const success = Math.random() > 0.3; // 70% chance of success for demo
      
      if (success) {
        setConnectionStatus('success');
        updateFormData({ isConnected: true });
      } else {
        setConnectionStatus('error');
      }
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (formData.isConnected) {
      onNext();
    } else {
      testConnection();
    }
  };

  const renderSelfHostedForm = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="hostname" className="block text-sm font-medium text-gray-700 mb-1">
            Hostname <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="hostname"
            name="hostname"
            value={formData.connectionDetails.hostname}
            onChange={handleChange}
            placeholder="e.g., localhost or db.example.com"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
              errors.hostname ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.hostname && <p className="mt-1 text-sm text-red-500">{errors.hostname}</p>}
        </div>
        
        <div>
          <label htmlFor="port" className="block text-sm font-medium text-gray-700 mb-1">
            Port <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="port"
            name="port"
            value={formData.connectionDetails.port}
            onChange={handleChange}
            placeholder="e.g., 5432 for PostgreSQL"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
              errors.port ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.port && <p className="mt-1 text-sm text-red-500">{errors.port}</p>}
        </div>
      </div>
      
      <div className="mb-6">
        <label htmlFor="databaseName" className="block text-sm font-medium text-gray-700 mb-1">
          Database Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="databaseName"
          name="databaseName"
          value={formData.connectionDetails.databaseName}
          onChange={handleChange}
          placeholder="Enter database name"
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
            errors.databaseName ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.databaseName && <p className="mt-1 text-sm text-red-500">{errors.databaseName}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.connectionDetails.username}
            onChange={handleChange}
            placeholder="Enter username"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
              errors.username ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.connectionDetails.password}
            onChange={handleChange}
            placeholder="Enter password"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="useSSL"
            name="useSSL"
            checked={formData.connectionDetails.useSSL}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="useSSL" className="ml-2 block text-sm text-gray-700">
            Use SSL Connection
          </label>
        </div>
        
        {formData.connectionDetails.useSSL && (
          <div className="pl-6 pt-2 border-l-2 border-indigo-100">
            <p className="text-sm text-gray-600 mb-2">
              SSL configuration options would appear here
            </p>
          </div>
        )}
      </div>
    </>
  );

  const renderImportedDataSourceForm = () => (
    <>
      <div className="mb-6">
        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
          API Key / OAuth Token <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="password"
            id="apiKey"
            name="apiKey"
            value={formData.connectionDetails.apiKey}
            onChange={handleChange}
            placeholder="Enter your API key"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
              errors.apiKey ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <Lock className="absolute right-3 top-2.5 text-gray-400" size={18} />
        </div>
        {errors.apiKey && <p className="mt-1 text-sm text-red-500">{errors.apiKey}</p>}
      </div>
      
      <div className="mb-6">
        <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-1">
          Account ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="accountId"
          name="accountId"
          value={formData.connectionDetails.accountId}
          onChange={handleChange}
          placeholder="Enter account ID"
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
            errors.accountId ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.accountId && <p className="mt-1 text-sm text-red-500">{errors.accountId}</p>}
      </div>
      
      {formData.databaseType === 'googlesheets' && (
        <div className="mb-6">
          <label htmlFor="datasetId" className="block text-sm font-medium text-gray-700 mb-1">
            Dataset ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="datasetId"
            name="datasetId"
            value={formData.connectionDetails.datasetId}
            onChange={handleChange}
            placeholder="Enter dataset ID"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
              errors.datasetId ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.datasetId && <p className="mt-1 text-sm text-red-500">{errors.datasetId}</p>}
        </div>
      )}
    </>
  );

  return (
    <div className="animate-fadeIn bg-white p-8 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-8 text-gray-800">
        Connection Details for {formData.databaseType.charAt(0).toUpperCase() + formData.databaseType.slice(1)}
      </h2>
      
      <form onSubmit={handleSubmit}>
        {formData.sourceType === 'self-hosted' ? renderSelfHostedForm() : renderImportedDataSourceForm()}
        
        {/* Connection status */}
        {connectionStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-green-700">
            <CheckCircle size={20} />
            <span>Connection successful! You can proceed to the next step.</span>
          </div>
        )}
        
        {connectionStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <span>Connection failed. Please check your credentials and try again.</span>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors w-full md:w-auto"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Back</span>
          </button>
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <button
              type="button"
              onClick={testConnection}
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-3 border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors w-full md:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                'Test Connection'
              )}
            </button>
            
            <button
              type="submit"
              disabled={isLoading || (!formData.isConnected && connectionStatus !== 'success')}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg transition-colors w-full md:w-auto ${
                isLoading || (!formData.isConnected && connectionStatus !== 'success')
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <span className="font-semibold">Next</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ConnectionDetailsForm;
