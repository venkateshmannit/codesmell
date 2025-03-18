import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Repository } from '../../types';
import Header from '../../components/Header';

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

  // Use the dropdown for GitHub users or manual input otherwise
  const currentRepo = isGithubUser ? repositoryDropdown : repositoryManual;

  const handleFinish = async () => {
    if (!currentRepo || !branch) {
      toast.error('Please provide both repository and branch');
      return;
    }
    // Save the selected repository and branch in the backend DB
    try {
      await axios.post(
        '/api/repo_history',
        { repository: currentRepo, branch },
        { headers: { 'API-Key': user?.api_key } }
      );
      toast.success('Repository added!');
      navigate('/chatpage');
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to save repository');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Fixed Header */}
      <div className="w-full fixed top-0 left-0 z-50">
        <Header />
      </div>

      {/* Main Content */}
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
                <div className="mt-3">
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
              className="py-3 px-6 text-white bg-green-600 hover:bg-green-700 rounded-md font-semibold shadow-lg transition-colors"
            >
              Finish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;






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







def get_user_from_api_key(api_key):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, username FROM users WHERE api_key = %s", (api_key,))
        user = cursor.fetchone()
        return user  # Returns tuple (id, username) or None
    except Exception as e:
        return None
    finally:
        cursor.close()
        conn.close()


@app.route('/api/repo_history', methods=['POST'])
def save_repo_history():
    api_key = request.headers.get("API-Key")
    user_data = get_user_from_api_key(api_key)
    if not user_data:
        return jsonify({"message": "Invalid API key"}), 401

    user_id = user_data[0]
    data = request.json
    repository = data.get("repository")
    branch = data.get("branch")
    if not repository or not branch:
        return jsonify({"message": "Repository and branch are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO repo_history (user_id, repository, branch) VALUES (%s, %s, %s)",
            (user_id, repository, branch)
        )
        conn.commit()
        return jsonify({"message": "Repository history saved successfully!"}), 201
    except psycopg2.Error as e:
        conn.rollback()
        return jsonify({"message": "Failed to save repository history", "error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()


@app.route('/api/repo_history', methods=['GET'])
def get_repo_history():
    api_key = request.headers.get("API-Key")
    user_data = get_user_from_api_key(api_key)
    if not user_data:
        return jsonify({"message": "Invalid API key"}), 401

    user_id = user_data[0]
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT id, repository, branch, created_at FROM repo_history WHERE user_id = %s ORDER BY created_at DESC",
            (user_id,)
        )
        rows = cursor.fetchall()
        repo_list = [
            {"id": row[0], "repository": row[1], "branch": row[2], "created_at": row[3].isoformat()} for row in rows
        ]
        return jsonify({"message": "Repository history fetched successfully!", "data": repo_list}), 200
    except psycopg2.Error as e:
        return jsonify({"message": "Failed to fetch repository history", "error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

or

def get_user_from_api_key(api_key):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, username FROM users WHERE api_key = %s", (api_key,))
        user = cursor.fetchone()
        return user  # Returns tuple (id, username) or None
    except Exception as e:
        return None
    finally:
        cursor.close()
        conn.close()


@app.route('/api/repo_history', methods=['POST'])
def save_repo_history():
    api_key = request.headers.get("API-Key")
    user_data = get_user_from_api_key(api_key)
    if not user_data:
        return jsonify({"message": "Invalid API key"}), 401

    user_id = user_data[0]
    data = request.json
    repository = data.get("repository")
    branch = data.get("branch")
    if not repository or not branch:
        return jsonify({"message": "Repository and branch are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO repo_history (user_id, repository, branch) VALUES (%s, %s, %s)",
            (user_id, repository, branch)
        )
        conn.commit()
        return jsonify({"message": "Repository history saved successfully!"}), 201
    except psycopg2.Error as e:
        conn.rollback()
        return jsonify({"message": "Failed to save repository history", "error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()


@app.route('/api/repo_history', methods=['GET'])
def get_repo_history():
    api_key = request.headers.get("API-Key")
    user_data = get_user_from_api_key(api_key)
    if not user_data:
        return jsonify({"message": "Invalid API key"}), 401

    user_id = user_data[0]
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT id, repository, branch, created_at FROM repo_history WHERE user_id = %s ORDER BY created_at DESC",
            (user_id,)
        )
        rows = cursor.fetchall()
        repo_list = [
            {"id": row[0], "repository": row[1], "branch": row[2], "created_at": row[3].isoformat()} for row in rows
        ]
        return jsonify({"message": "Repository history fetched successfully!", "data": repo_list}), 200
    except psycopg2.Error as e:
        return jsonify({"message": "Failed to fetch repository history", "error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()





        CREATE TABLE repo_history (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          repository VARCHAR(255) NOT NULL,
          branch VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      

      import React, { useState, useEffect } from "react";
      import {
        MessageSquare,
        ChevronRight,
        Copy as CopyIcon,
        Check,
        Download,
      } from "lucide-react";
      import { jsPDF } from "jspdf";
      import axios from "axios";
      import toast from "react-hot-toast";
      import Header from "../../../components/Header";
      import LeftSidebar from "../components/LeftSidebar";
      import { useAuth } from "../../../context/AuthContext";
      
      const suggestions = [
        {
          title: "suggested question",
          text: "what is the purpose of this project ?",
        },
        {
          title: "suggested question",
          text: "tell me something about technical document ?",
        },
        {
          title: "suggested question",
          text: "Data flow of the project ?",
        },
      ];
      
      const ChatPage: React.FC = () => {
        const { user } = useAuth();
        const [selectedRepo, setSelectedRepo] = useState<{
          name: string;
          branch: string;
          tree?: any[];
        }>({
          name: "MyRepo",
          branch: "main",
        });
      
        const [inputText, setInputText] = useState("");
        const [history, setHistory] = useState<
          Array<{ id: number; question: string; answer: string; created_at: string }>
        >([]);
        const [messages, setMessages] = useState<
          Array<{ role: string; text: string }>
        >([]);
        const [copySuccess, setCopySuccess] = useState(false);
        const [isSidebarOpen, setIsSidebarOpen] = useState(true);
      
        // Load repository info from session storage.
        useEffect(() => {
          const storedRepo = sessionStorage.getItem("selectedRepo");
          if (storedRepo) {
            try {
              const parsed = JSON.parse(storedRepo);
              const repoName = parsed.repo || parsed.name;
              setSelectedRepo({ name: repoName, branch: parsed.branch, tree: undefined });
            } catch (error) {
              console.error("Error parsing selectedRepo from session storage:", error);
            }
          }
        }, []);
      
        // Fetch file tree for selected repository.
        useEffect(() => {
          const fetchFileTree = async () => {
            try {
              const res = await axios.post("http://127.0.0.1:5000/api/filetree", {
                repository: selectedRepo.name,
                branch: selectedRepo.branch,
              });
              const fileTree = res.data.tree;
              setSelectedRepo((prev) => ({ ...prev, tree: fileTree }));
            } catch (error) {
              console.error("Error fetching file tree:", error);
              toast.error("Error fetching file tree");
            }
          };
          fetchFileTree();
        }, [selectedRepo.name, selectedRepo.branch]);
      
        // Fetch saved chat history from backend.
        useEffect(() => {
          const fetchChatHistory = async () => {
            try {
              const res = await axios.get("http://127.0.0.1:5000/api/chat_history", {
                headers: { "API-Key": user?.api_key },
                params: { repository: selectedRepo.name, branch: selectedRepo.branch },
              });
              setHistory(res.data.data);
            } catch (error) {
              console.error("Error fetching chat history:", error);
              toast.error("Error fetching chat history");
            }
          };
          if (user?.api_key) fetchChatHistory();
        }, [user, selectedRepo.name, selectedRepo.branch]);
      
        // Simulate typing effect for bot answer.
        const simulateTypingEffect = (fullText: string) => {
          const lines = fullText.split("\n");
          let currentLine = 0;
          let currentChar = 0;
          let displayedText = "";
          const interval = setInterval(() => {
            if (currentLine < lines.length) {
              if (currentChar < lines[currentLine].length) {
                displayedText += lines[currentLine][currentChar];
                currentChar++;
              } else {
                displayedText += "\n";
                currentLine++;
                currentChar = 0;
              }
              setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages];
                updatedMessages[updatedMessages.length - 1] = {
                  role: "bot",
                  text: displayedText,
                };
                return updatedMessages;
              });
            } else {
              clearInterval(interval);
            }
          }, 50);
        };
      
        // Handle sending a query.
        const handleAsk = async () => {
          if (inputText.trim() === "") return;
          // Add user's message.
          const userMsg = { role: "user", text: inputText };
          setMessages((prev) => [...prev, userMsg]);
          // Show a placeholder "loading" bot message.
          setMessages((prev) => [...prev, { role: "bot", text: "" }]);
      
          try {
            const res = await axios.post("http://127.0.0.1:5000/api/repositoryanalysis", {
              repository: selectedRepo.name,
              branch: selectedRepo.branch,
              query: inputText,
            });
            const { content } = res.data;
            const fullResponseText = `${content}`;
            simulateTypingEffect(fullResponseText);
      
            // Save chat history (question and answer) to backend.
            await axios.post(
              "http://127.0.0.1:5000/api/chat_history",
              {
                repository: selectedRepo.name,
                branch: selectedRepo.branch,
                question: inputText,
                answer: fullResponseText,
              },
              { headers: { "API-Key": user?.api_key } }
            );
            // Refresh chat history.
            const historyRes = await axios.get("http://127.0.0.1:5000/api/chat_history", {
              headers: { "API-Key": user?.api_key },
              params: { repository: selectedRepo.name, branch: selectedRepo.branch },
            });
            setHistory(historyRes.data.data);
          } catch (error) {
            console.error("Error fetching query response:", error);
            toast.error("Error fetching query response");
            setMessages((prev) => prev.slice(0, -1));
          }
          setInputText("");
        };
      
        const toggleSidebar = () => {
          setIsSidebarOpen((prev) => !prev);
        };
      
        const handleCopyAllHistory = () => {
          const fullConversationText = messages
            .map((msg) => `${msg.role === "user" ? "Q: " : "A: "}${msg.text}`)
            .join("\n\n");
          navigator.clipboard.writeText(fullConversationText);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 3000);
        };
      
        const handleExportFullHistory = () => {
          const doc = new jsPDF();
          let y = 10;
          doc.text("Conversation History", 10, y);
          y += 10;
          messages.forEach((msg) => {
            const prefix = msg.role === "user" ? "Q: " : "A: ";
            const lines = doc.splitTextToSize(prefix + msg.text, 180);
            doc.text(lines, 10, y);
            y += lines.length * 10;
          });
          doc.save("conversation.pdf");
        };
      
        return (
          <>
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative flex flex-col overflow-hidden">
              <div className="w-full fixed top-0 left-0 z-50">
                <Header />
              </div>
              <style>{`
                .hide-scrollbar {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
                .hide-scrollbar::-webkit-scrollbar {
                  display: none;
                }
                .no-overscroll {
                  overscroll-behavior: none;
                }
                .spinner {
                  border: 4px solid rgba(0, 0, 0, 0.1);
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  border-left-color: #09f;
                  animation: spin 1s linear infinite;
                  display: inline-block;
                  vertical-align: middle;
                  margin-left: 8px;
                }
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
              <div className="flex h-screen w-full bg-teal-50 relative">
                <div className={`transition-all duration-300 ${isSidebarOpen ? "w-72" : "w-0"} overflow-hidden`}>
                  <LeftSidebar
                    repo={selectedRepo}
                    history={history}
                    onCopy={() => {}}
                    onToggle={toggleSidebar}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    onRename={() => {}}
                    onArchive={() => {}}
                    onExport={() => {}}
                  />
                </div>
                {!isSidebarOpen && (
                  <button
                    onMouseEnter={toggleSidebar}
                    onClick={toggleSidebar}
                    className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white border p-2 rounded-r shadow-md hover:bg-gray-100"
                    title="Open Sidebar"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                )}
                <main className="flex-1 flex flex-col w-full max-w-4xl mx-auto pt-4 mt-16">
                  <div className="text-center mb-4">
                    <MessageSquare className="w-10 h-10 text-gray-500 mx-auto" />
                    <h2 className="text-gray-800 text-lg font-semibold mt-4">Explore Repository Insights</h2>
                    <p className="text-gray-600">Ask your repository questions below.</p>
                    <p className="text-sm text-gray-500">
                      Repository: {selectedRepo.name}, Branch: {selectedRepo.branch}
                    </p>
                  </div>
                  <div className="flex justify-end items-center space-x-2 p-2">
                    <button onClick={handleCopyAllHistory} title="Copy full conversation">
                      {copySuccess ? (
                        <Check className="w-5 h-5 text-teal-600" />
                      ) : (
                        <CopyIcon className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                    <button onClick={handleExportFullHistory} title="Export full conversation to PDF">
                      <Download className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 hide-scrollbar no-overscroll">
                    {messages.length > 0 ? (
                      messages.map((msg, index) => (
                        <div key={index} className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                          <span
                            className={`inline-block p-2 rounded ${
                              msg.role === "user" ? "bg-purple-100 text-teal-800" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {msg.text || (msg.role === "bot" && (
                              <>
                                AI is thinking...
                                <span className="spinner" />
                              </>
                            ))}
                          </span>
                        </div>
                      ))
                    ) : (
                      history.length === 0 && (
                        <div className="mt-4 flex space-x-4 justify-center">
                          {suggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="p-4 border rounded-lg bg-white shadow-lg w-60 text-sm cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={() => setInputText(suggestion.text)}
                            >
                              <span className="text-teal-600 font-semibold">{suggestion.title}</span>
                              <p className="mt-2 text-gray-700">{suggestion.text}</p>
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                  <div className="p-10">
                    <div className="w-full flex border rounded-lg overflow-hidden bg-white shadow-lg">
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Ask to explore your data"
                        className="flex-1 px-4 py-2 outline-none text-gray-800"
                      />
                      <button
                        className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 transition-colors"
                        onClick={handleAsk}
                      >
                        Ask
                      </button>
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </>
        );
      };
      
      export default ChatPage;

      



      @app.route('/api/chat_history', methods=['POST'])
def save_chat_history():
    api_key = request.headers.get("API-Key")
    user_data = get_user_from_api_key(api_key)
    if not user_data:
        return jsonify({"message": "Invalid API key"}), 401

    user_id = user_data[0]
    data = request.json
    repository = data.get("repository")
    branch = data.get("branch")
    question = data.get("question")
    answer = data.get("answer")

    if not all([repository, branch, question, answer]):
        return jsonify({"message": "repository, branch, question and answer are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO chat_history (user_id, repository, branch, question, answer) VALUES (%s, %s, %s, %s, %s)",
            (user_id, repository, branch, question, answer)
        )
        conn.commit()
        return jsonify({"message": "Chat history saved successfully!"}), 201
    except psycopg2.Error as e:
        conn.rollback()
        return jsonify({"message": "Failed to save chat history", "error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()


@app.route('/api/chat_history', methods=['GET'])
def get_chat_history():
    api_key = request.headers.get("API-Key")
    user_data = get_user_from_api_key(api_key)
    if not user_data:
        return jsonify({"message": "Invalid API key"}), 401

    user_id = user_data[0]
    repository = request.args.get("repository")
    branch = request.args.get("branch")

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if repository and branch:
            cursor.execute(
                "SELECT id, question, answer, created_at FROM chat_history WHERE user_id = %s AND repository = %s AND branch = %s ORDER BY created_at DESC",
                (user_id, repository, branch)
            )
        else:
            cursor.execute(
                "SELECT id, question, answer, created_at FROM chat_history WHERE user_id = %s ORDER BY created_at DESC",
                (user_id,)
            )
        rows = cursor.fetchall()
        history_list = [
            {"id": row[0], "question": row[1], "answer": row[2], "created_at": row[3].isoformat()} for row in rows
        ]
        return jsonify({"message": "Chat history fetched successfully!", "data": history_list}), 200
    except psycopg2.Error as e:
        return jsonify({"message": "Failed to fetch chat history", "error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()





        CREATE TABLE chat_history (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          repository VARCHAR(255) NOT NULL,
          branch VARCHAR(255) NOT NULL,
          question TEXT NOT NULL,
          answer TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
