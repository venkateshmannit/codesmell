import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Database, 
  Server, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  Loader
} from 'lucide-react';
import ProjectInfoForm from './components/ProjectInfoForm';
import DatabaseTypeSelection from './components/DatabaseTypeSelection';
import ConnectionDetailsForm from './components/ConnectionDetailsForm';
import DatabaseExplorer from './components/DatabaseExplorer';
import StepIndicator from './components/StepIndicator';
import Header from '../../components/Header';

function RepoCon() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    projectName: "",
    databaseType: "",
    sourceType: "", // 'self-hosted' or 'imported'
    connectionDetails: {
      hostname: "",
      port: "",
      databaseName: "",
      username: "",
      password: "",
      useSSL: false,
      sslConfig: {},
      apiKey: "",
      accountId: "",
      datasetId: "",
    },
    selectedTables: [],
    isConnected: false,
    isLoading: false,
    error: null,
  });

  const updateFormData = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Final submission logic would go here
    console.log("Form submitted:", formData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProjectInfoForm
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <DatabaseTypeSelection
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <ConnectionDetailsForm
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <DatabaseExplorer
            formData={formData}
            updateFormData={updateFormData}
            onBack={handleBack}
            onFinish={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
      {/* Full-width fixed header */}
      <div className="w-full fixed top-0 left-0 z-50">
        <Header />
      </div>

      {/* Card styled in pandu flow with responsive fixed height */}
      <div className="w-full sm:w-10/12 md:w-8/12 h-auto md:h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-gray-300 mt-20">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2">
          <h1 className="text-2xl font-bold text-white">
            Database Connection Setup
          </h1>
          <p className="text-purple-100 text-xs">
            Connect your data source in a few simple steps
          </p>
        </div>

        <div className="p-6">
          <StepIndicator currentStep={currentStep} totalSteps={4} />
          <div className="mt-8">{renderStep()}</div>
        </div>
      </div>
    </div>
  );
}

export default RepoCon;
