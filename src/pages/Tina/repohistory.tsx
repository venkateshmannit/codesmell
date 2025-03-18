import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Repo {
  id: number;
  repository: string;
  branch: string;
  created_at: string;
}

const RepoHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [repoHistory, setRepoHistory] = useState<Repo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRepoHistory = async () => {
      try {
        const res = await axios.get('/api/repo_history', {
          headers: { 'API-Key': user?.api_key },
        });
        setRepoHistory(res.data.data);
      } catch (error: any) {
        console.error(error);
        toast.error('Failed to fetch repository history');
      }
    };

    fetchRepoHistory();
  }, [user]);

  // Filter repos based on the search term (case-insensitive)
  const filteredRepos = repoHistory.filter((item) =>
    item.repository.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 relative flex flex-col">
      {/* Fixed Header */}
      <div className="w-full fixed top-0 left-0 z-50">
        <Header />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-start px-4 relative z-10 mt-24 space-y-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="absolute top-4 right-4 py-2 px-6 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold rounded-full shadow-lg transition-all transform hover:scale-105"
        >
          Add Repo
        </button>
        {/* History Heading aligned to top left */}
        <div className="w-full max-w-5xl">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600 text-left">
            History
          </h1>
        </div>
        {/* Search Bar */}
        <div className="w-full max-w-5xl mt-8">
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {filteredRepos.length > 0 ? (
          <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredRepos.slice(0).reverse().map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    {item.repository}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    Branch: {item.branch}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    toast.success(`Exploring project: ${item.repository}`);
                    navigate('/chatpage');
                  }}
                  className="mt-6 py-2 px-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-sm font-medium rounded-lg shadow"
                >
                  Explore the project
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xl text-gray-700 dark:text-gray-300">
            No repositories selected.
          </p>
        )}

        {/* Go Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mt-8 py-3 px-6 text-white bg-green-600 hover:bg-green-700 rounded-md font-semibold shadow-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default RepoHistory;
