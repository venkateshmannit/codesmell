import React from 'react';
import { CheckCircle } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  const steps = [
    { number: 1, title: 'Project Info' },
    { number: 2, title: 'Database Type' },
    { number: 3, title: 'Connection Details' },
    { number: 4, title: 'Database Explorer' },
  ];

  return (
    <div className="flex justify-between">
      {steps.map((step) => {
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;
        
        return (
          <div 
            key={step.number} 
            className={`flex flex-col items-center relative flex-1 ${
              isActive ? 'text-indigo-600' : isCompleted ? 'text-green-500' : 'text-gray-400'
            }`}
          >
            {/* Connector line */}
            {step.number < totalSteps && (
              <div 
                className={`absolute top-5 w-full h-1 left-1/2 ${
                  step.number < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
            
            {/* Step circle */}
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                isActive 
                  ? 'bg-indigo-100 border-2 border-indigo-600 text-indigo-600' 
                  : isCompleted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
              }`}
            >
              {isCompleted ? (
                <CheckCircle size={20} />
              ) : (
                <span>{step.number}</span>
              )}
            </div>
            
            {/* Step title */}
            <div className="mt-2 text-sm font-medium">
              {step.title}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;