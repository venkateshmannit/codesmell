import React, { useState, useEffect } from 'react';
import { Loader, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Repository } from '../types';
import Header from '../components/Header';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isGithubUser = user?.authType === 'github';

  // Form states
  const [branch, setBranch] = useState('');
  const [repositoryManual, setRepositoryManual] = useState('');
  const [repositoryDropdown, setRepositoryDropdown] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  // New state: list of selected repositories (repo name and branch)
  const [selectedRepos, setSelectedRepos] = useState<
    { repo: string; branch: string }[]
  >([]);

  useEffect(() => {
    const fetchRepos = async () => {
      if (isGithubUser) {
        setLoadingRepos(true);
        try {
          const accessToken = user?.api_key;
          const res = await axios.get('https://api.github.com/user/repos', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const repos = res.data.map((repo: any) => ({
            full_name: repo.full_name,
            description: repo.description || '',
          }));
          setRepositories(repos);
        } catch (error) {
          toast.error('Failed to fetch GitHub repositories');
        } finally {
          setLoadingRepos(false);
        }
      }
    };
    fetchRepos();
  }, [isGithubUser, user]);

  // Determine current repository selection
  const currentRepo = isGithubUser ? repositoryDropdown : repositoryManual;

  // Handler for the Finish button
  const handleFinish = () => {
    if (!currentRepo || !branch) {
      toast.error('Please provide both repository and branch');
      return;
    }
    const updatedRepos = [...selectedRepos, { repo: currentRepo, branch }];
    setSelectedRepos(updatedRepos);
    toast.success('Repository added!');
    // Save the selected repositories to session storage
    sessionStorage.setItem('selectedRepos', JSON.stringify(updatedRepos));
    // Navigate to the /chatpage
    navigate('/chatpage');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 relative flex flex-col">
      {/* Fixed Header */}
      <div className="w-full fixed top-0 left-0 z-50">
        <Header />
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-500/10 dark:bg-green-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-green-500/10 dark:bg-green-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 mt-20 space-y-8">
        <div className="max-w-4xl w-full text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600">
            repo selection page dashbord
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300">
            Manage your repositories and ask questions about your projects.
          </p>
        </div>

        {/* Repository Selection Form */}
        <div className="group relative w-full max-w-4xl">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 space-y-6 shadow-2xl">
            {isGithubUser ? (
              <div>
                <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Select Your Repository
                </label>
                {loadingRepos ? (
                  <div className="flex justify-center mt-3">
                    <Loader className="animate-spin h-8 w-8 text-green-600" />
                  </div>
                ) : (
                  <div className="relative mt-3">
                    <select
                      className="block appearance-none w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 py-3 px-4 pr-10 rounded-md leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={repositoryDropdown}
                      onChange={(e) => setRepositoryDropdown(e.target.value)}
                    >
                      <option value="">Select a repository</option>
                      {repositories.map((repo) => (
                        <option key={repo.full_name} value={repo.full_name}>
                          {repo.full_name}
                        </option>
                      ))}
                    </select>
                    {/* <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <ArrowDown className="h-4 w-4" />
                    </div> */}
                  </div>
                )}
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
                  value={repositoryManual}
                  onChange={(e) => setRepositoryManual(e.target.value)}
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

            <div className="flex justify-end">
              <button
                onClick={handleFinish}
                className="py-3 px-6 text-white bg-green-600 hover:bg-green-700 rounded-md font-semibold shadow-lg transition-colors flex items-center justify-center"
              >
                Finish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
