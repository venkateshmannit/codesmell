import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface ProjectInfoFormProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
}

const ProjectInfoForm: React.FC<ProjectInfoFormProps> = ({ 
  formData, 
  updateFormData, 
  onNext 
}) => {
  const [errors, setErrors] = useState<{ projectName?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ [e.target.name]: e.target.value });
    
    // Clear error when user types
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const newErrors: { projectName?: string } = {};
    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onNext();
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Project Information</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-8">
          <label 
            htmlFor="projectName" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="projectName"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            placeholder="Enter your project name"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
              errors.projectName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.projectName && (
            <p className="mt-2 text-sm text-red-500">{errors.projectName}</p>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-transform transform hover:-translate-y-1"
          >
            Next
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectInfoForm;
