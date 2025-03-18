import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';

const Dashboarddemo: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isGithubUser = user?.authType === 'github';

  // Form states for manual inputs
  const [branch, setBranch] = useState('');
  const [repository, setRepository] = useState('');
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loading, setLoading] = useState(false);

  // Predefined project templates for radio selection
  const projectTemplates = [
    {
      label: "Python Project",
      repo: "garimasingh128/awesome-python-projects",
      branch: "master",
    },
    {
      label: "Java Project",
      repo: "jaygajera17/E-commerce-project-springBoot",
      branch: "master",
    },
    {
      label: "Go Project",
      repo: "grpc-ecosystem/grpc-gateway",
      branch: "master",
    },
  ];

  // Fetch GitHub repositories if the user is authenticated via GitHub
  useEffect(() => {
    const fetchRepos = async () => {
      if (isGithubUser) {
        setLoadingRepos(true);
        try {
          // Log the token for debugging (ensure this is secure in production)
          console.log("GitHub token:", user?.api_key);
          await axios.get('https://api.github.com/user/repos', {
            headers: { Authorization: `Bearer ${user?.api_key}` },
          });
        } catch (error) {
          toast.error('Failed to fetch GitHub repositories');
        } finally {
          setLoadingRepos(false);
        }
      }
    };
    fetchRepos();
  }, [isGithubUser, user]);

  const currentRepo = repository;

  // Poll the indexing status until it is completed
  const handleFinish = async (repository_id: string) => {
    // Set loading state when button is clicked
    setLoading(true);

    // Retrieve authToken from session storage to use as API-Key
    const authToken = sessionStorage.getItem('authToken');
    if (!authToken) {
      toast.error('No auth token found in session');
      setLoading(false);
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/api/repositories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API-Key': authToken
        },
        body: JSON.stringify({
          repository: currentRepo,
          branch: branch
        })
      });
  
      if (!response.ok) {
        throw new Error('API request failed');
      }
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
  
    // Show success notification
    toast.success('Repository indexed successfully!');
    // Save repository info in session storage
    sessionStorage.setItem('selectedRepo', JSON.stringify({ name: currentRepo, branch }));
    // Navigate to the chat page immediately
    navigate('/chatpage');
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <div className="w-full fixed top-0 left-0 z-50">
        <Header />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 mt-20 space-y-8">
        <div className="max-w-4xl w-full text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600">
            Repository Selection
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300">
            Manage your repositories and ask questions about your projects.
          </p>
        </div>
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl p-8 space-y-6 shadow-2xl">
          {isGithubUser && loadingRepos ? (
            <div className="flex justify-center mt-3">
              <Loader className="animate-spin h-8 w-8 text-green-600" />
            </div>
          ) : (
            <div>
              <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200">
                Repository (username/repository_name)
              </label>
              <input
                type="text"
                className="mt-3 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="e.g. github_username/repository_name"
                value={repository}
                onChange={(e) => setRepository(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200">
              Branch
            </label>
            <input
              type="text"
              className="mt-3 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="main"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />
          </div>
          {/* Project template selection */}
          <div className="mt-6">
            <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Choose a Project Template:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {projectTemplates.map((template) => (
                <label
                  key={template.repo}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors 
                    ${repository === template.repo ? 'border-green-600 bg-green-200' : 'border-gray-400 hover:border-green-400'} 
                    dark:border-gray-600 dark:hover:border-green-400`}
                >
                  <input
                    type="radio"
                    name="projectTemplate"
                    value={template.repo}
                    checked={repository === template.repo}
                    onChange={() => {
                      setRepository(template.repo);
                      setBranch(template.branch);
                    }}
                    className="form-radio h-5 w-5 text-green-600 mr-3"
                  />
                  <div>
                    <span className={`block font-medium ${repository === template.repo ? 'text-green-600' : 'text-gray-800 dark:text-gray-200'}`}>
                      {template.label}
                    </span>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">
                      {template.repo} <span className="mx-1">&middot;</span> Branch: {template.branch}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => handleFinish('')}
              className="py-3 px-6 text-white bg-green-600 hover:bg-green-700 rounded-md font-semibold shadow-lg transition-colors"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboarddemo;
