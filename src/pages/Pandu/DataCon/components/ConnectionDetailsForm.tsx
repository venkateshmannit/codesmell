import React, { useState } from 'react';
import { ArrowLeft, Loader, CheckCircle, AlertCircle, Lock } from 'lucide-react';

interface ConnectionDetailsFormProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  onTestConnection: () => Promise<void>;
}

const ConnectionDetailsForm: React.FC<ConnectionDetailsFormProps> = ({
  formData,
  updateFormData,
  onNext,
  onBack,
  onTestConnection,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [connectionError, setConnectionError] = useState<string>(''); // New state for error message

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    updateFormData({
      connectionDetails: {
        ...formData.connectionDetails,
        [name]: type === 'checkbox' ? checked : value,
      },
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    // Reset connection status and error message on any change so the user must re-test
    if (connectionStatus !== 'idle') {
      setConnectionStatus('idle');
      updateFormData({ isConnected: false });
      setConnectionError('');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (formData.sourceType === 'self-hosted') {
      if (!formData.connectionDetails.hostname || !formData.connectionDetails.hostname.trim())
        newErrors.hostname = 'Hostname is required';
      if (!formData.connectionDetails.port || !formData.connectionDetails.port.trim())
        newErrors.port = 'Port is required';
      else if (isNaN(Number(formData.connectionDetails.port)))
        newErrors.port = 'Port must be a number';
      if (!formData.connectionDetails.databaseName || !formData.connectionDetails.databaseName.trim())
        newErrors.databaseName = 'Database name is required';
      if (!formData.connectionDetails.username || !formData.connectionDetails.username.trim())
        newErrors.username = 'Username is required';
      if (!formData.connectionDetails.password || !formData.connectionDetails.password.trim())
        newErrors.password = 'Password is required';
    } else {
      if (!formData.connectionDetails.apiKey || !formData.connectionDetails.apiKey.trim())
        newErrors.apiKey = 'API Key is required';
      if (!formData.connectionDetails.accountId || !formData.connectionDetails.accountId.trim())
        newErrors.accountId = 'Account ID is required';
      if (formData.databaseType === 'googlesheets' && (!formData.connectionDetails.datasetId || !formData.connectionDetails.datasetId.trim()))
        newErrors.datasetId = 'Dataset ID is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTestConnection = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onTestConnection();
      setConnectionStatus('success');
      updateFormData({ isConnected: true });
      // Automatically navigate to the next section upon a successful connection test
      onNext();
    } catch (error: any) {
      setConnectionStatus('error');
      updateFormData({ isConnected: false });
      setConnectionError('Unable to establish connection. Please review your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="overflow-y-auto" style={{ maxHeight: '400px', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
      <div className="animate-fadeIn bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-8 text-gray-800">
          Connection Details for {formData.databaseType.charAt(0).toUpperCase() + formData.databaseType.slice(1)}
        </h2>
        <form onSubmit={(e) => e.preventDefault()}>
          {formData.sourceType === 'self-hosted' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Hostname */}
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
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 transition-colors ${
                      errors.hostname ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.hostname && <p className="mt-1 text-sm text-red-500">{errors.hostname}</p>}
                </div>
                {/* Port */}
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
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 transition-colors ${
                      errors.port ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.port && <p className="mt-1 text-sm text-red-500">{errors.port}</p>}
                </div>
                {/* Database Name */}
                <div>
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
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 transition-colors ${
                      errors.databaseName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.databaseName && <p className="mt-1 text-sm text-red-500">{errors.databaseName}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Username */}
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
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 transition-colors ${
                      errors.username ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
                </div>
                {/* Password */}
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
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 transition-colors ${
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
                    className="h-4 w-4 text-purple-600 focus:ring-purple-600 border-gray-300 rounded"
                  />
                  <label htmlFor="useSSL" className="ml-2 block text-sm text-gray-700">
                    Use SSL Connection
                  </label>
                </div>
                {formData.connectionDetails.useSSL && (
                  <div className="pl-6 pt-2 border-l-2 border-purple-100">
                    <p className="text-sm text-gray-600 mb-2">SSL configuration options would appear here</p>
                  </div>
                )}
              </div>
            </>
          ) : (
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
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 transition-colors ${
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
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 transition-colors ${
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
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 transition-colors ${
                      errors.datasetId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.datasetId && <p className="mt-1 text-sm text-red-500">{errors.datasetId}</p>}
                </div>
              )}
            </>
          )}

          {/* Display a professional error message if the connection test fails */}
          {connectionStatus === 'error' && connectionError && (
            <div className="mt-4 p-4 border border-red-200 bg-red-50 rounded">
              <p className="text-red-600">{connectionError}</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors w-full md:w-auto"
            >
              <ArrowLeft size={20} />
              <span className="font-semibold">Back</span>
            </button>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-3 border border-purple-300 text-purple-600 rounded-lg transition-colors w-full md:w-auto"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader size={20} className="animate-spin" />
                  <span className="animate-pulse">Testing...</span>
                </div>
              ) : connectionStatus === 'success' ? (
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-500" />
                  <span className="font-semibold text-green-500 animate-fadeIn">Connection Successful</span>
                </div>
              ) : connectionStatus === 'error' ? (
                <div className="flex items-center gap-2">
                  <AlertCircle size={20} className="text-red-500" />
                  <span className="font-semibold text-red-500 animate-fadeIn">Connection Failed</span>
                </div>
              ) : (
                'Test Connection'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectionDetailsForm;
