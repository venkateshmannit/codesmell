import React, { useState, useEffect } from 'react';
import { Github } from 'lucide-react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';

const GitHubLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // This useEffect checks if there's a token in the URL and stores it in sessionStorage.
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');
    if (token) {
      sessionStorage.setItem('token', token);
      // Optionally, you can remove the token from the URL after saving it:
      const url = new URL(window.location.toString());
      url.searchParams.delete('token');
      window.history.replaceState({}, document.title, url.toString());
    }
  }, []);

  const handleGitHubLogin = () => {
    setLoading(true);
    // Store that the GitHub login option was clicked
    sessionStorage.setItem('loginOption', 'github');
    // Redirect to your backend GitHub login endpoint
    window.location.href = 'http://localhost:5000/github/login';
  };

  const handleDemoProject = () => {
    // Store that the Demo Project option was clicked
    sessionStorage.setItem('loginOption', 'demo');
    // Navigate to the Dashboarddemo route
    navigate('/Dashboarddemo');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative flex flex-col">
      {/* Full-width fixed header */}
      <div className="w-full fixed top-0 left-0 z-50">
        <Header />
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-500/10 dark:bg-green-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-green-500/10 dark:bg-green-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 right-1/4 w-64 h-64 bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Content container */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 mt-16">
        {/* Intro text */}
        <div className="max-w-4xl w-full text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400">
            Welcome
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300">
            Choose an option to proceed.
          </p>
        </div>

        {/* Cards container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* GitHub Login Card */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-full">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <Github className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Open Your Repo</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6 flex-grow">
                Use your GitHub account to quickly access your dashboard.
              </p>
              <button
                onClick={handleGitHubLogin}
                disabled={loading}
                className="flex items-center justify-center w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1 disabled:opacity-50"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <Github className="h-6 w-6 mr-2" />
                )}
                {loading ? 'Redirecting...' : 'Start'}
              </button>
            </div>
          </div>

          {/* Demo Project Card */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-full">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4"></path>
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Demo Project</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6 flex-grow">
                Explore a demo project repository.
              </p>
              <button
                onClick={handleDemoProject}
                className="flex items-center justify-center w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubLogin;
