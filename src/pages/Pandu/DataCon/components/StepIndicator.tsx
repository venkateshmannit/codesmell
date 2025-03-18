//src\pages\Pandu\DataCon\components\StepIndicator.tsx
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
              isActive ? 'text-purple-600' : isCompleted ? 'text-purple-600' : 'text-gray-400'
            }`}
          >
            {step.number < totalSteps && (
              <div 
                className={`absolute top-5 w-full h-1 left-1/2 ${
                  step.number < currentStep ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              />
            )}
            
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                isActive 
                  ? 'bg-purple-100 border-2 border-purple-600 text-purple-600' 
                  : isCompleted 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
              }`}
            >
              {isCompleted ? (
                <CheckCircle size={20} />
              ) : (
                <span>{step.number}</span>
              )}
            </div>
            
            <div className="mt-1 text-sm font-medium">
              {step.title}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
