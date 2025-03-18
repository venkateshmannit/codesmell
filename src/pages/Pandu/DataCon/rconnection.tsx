"use client";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../../../components/Header1';
import ProjectInfoForm from './components/ProjectInfoForm';
import DatabaseTypeSelection from './components/DatabaseTypeSelection';
import ConnectionDetailsForm from './components/ConnectionDetailsForm';
import DatabaseExplorer from './components/DatabaseExplorer';
import StepIndicator from './components/StepIndicator';
import { resetCurrentProject, saveSelectedTables } from './../../../api/table';

function RepoCon() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    projectName: "",
    databaseType: "",
    sourceType: "",
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
      displayName: ""
    },
    selectedTables: [] as string[],
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

  const handleExplorerBack = async () => {
    if (formData.sourceType === 'sample-database') {
      await resetCurrentProject();
      updateFormData({
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
          displayName: ""
        },
        isConnected: false,
        selectedTables: []
      });
      setCurrentStep(2);
    } else {
      handleBack();
    }
  };

  const handleTestConnection = async () => {
    const payload = {
      operationName: "SaveDataSource",
      variables: {
        data: {
          type: "POSTGRES",
          properties: {
            displayName: formData.connectionDetails.displayName || "testing_wrenai",
            host: formData.connectionDetails.hostname,
            port: formData.connectionDetails.port,
            user: formData.connectionDetails.username,
            password: formData.connectionDetails.password,
            database: formData.connectionDetails.databaseName,
          }
        }
      },
      query:
        "mutation SaveDataSource($data: DataSourceInput!) { saveDataSource(data: $data) { type properties __typename } }"
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/api/codesmell", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(payload)
      });
      const result = await response.json();
      console.log("Test Connection API Response:", result);
      if (result && result.data && result.data.saveDataSource) {
        toast.success("Connection successful!");
        updateFormData({ isConnected: true });
        // Optionally save connection history.
        const newHistory = {
          dbName: formData.connectionDetails.databaseName,
          user: formData.connectionDetails.username,
          time: new Date().toLocaleTimeString(),
          tables: formData.selectedTables,
        };
        const existingHistory = JSON.parse(localStorage.getItem("connectionHistory") || "[]");
        existingHistory.push(newHistory);
        localStorage.setItem("connectionHistory", JSON.stringify(existingHistory));
        setCurrentStep(4);
      } else {
        toast.error("Connection failed. Please verify your details.");
        updateFormData({ isConnected: false });
      }
    } catch (error) {
      console.error("Error calling Test Connection API:", error);
      toast.error("Error calling API");
    }
  };

  const handleFinishSetup = async () => {
    if (!formData.selectedTables || formData.selectedTables.length === 0) {
      toast.error("Please select at least one table to proceed.");
      return;
    }
    try {
      const saveResult = await saveSelectedTables(formData.selectedTables);
      console.log("Save Selected Tables Response:", saveResult);
      if (saveResult && saveResult.data) {
        localStorage.setItem("selectedTables", JSON.stringify(formData.selectedTables));
        localStorage.setItem("modelingData", JSON.stringify({
          selectedTables: formData.selectedTables,
          connectionDetails: formData.connectionDetails,
          projectName: formData.projectName,
        }));
        navigate("/modeling", {
          state: {
            selectedTables: formData.selectedTables,
            connectionDetails: formData.connectionDetails,
            projectName: formData.projectName,
          }
        });
      } else {
        toast.error("Failed to save selected tables. Please try again.");
      }
    } catch (error) {
      console.error("Error saving selected tables:", error);
      toast.error("Error saving selected tables");
    }
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
            onBack={handleBack}
            onTestConnection={handleTestConnection}
            onNext={handleNext}
          />
        );
      case 4:
        return (
          <DatabaseExplorer
            formData={formData}
            updateFormData={updateFormData}
            onBack={handleExplorerBack}
            onFinish={handleFinishSetup}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full fixed top-0 left-0 z-50">
        <Header />
      </div>
      <div className="max-w-screen-xl mx-auto pt-28 pb-10 px-4">
        <div className="bg-white shadow-xl rounded-xl ring-1 ring-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5">
            <h2 className="text-2xl font-bold text-white">Database Connection Setup</h2>
            <p className="text-white text-sm mt-1">Connect your data source in a few simple steps</p>
          </div>
          <div className="bg-white px-6 pt-4 pb-2">
            <StepIndicator currentStep={currentStep} totalSteps={4} />
          </div>
          <div className="px-6 pb-8">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RepoCon;
