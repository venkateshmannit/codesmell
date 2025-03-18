export const API_BASE_URL = 'http://127.0.0.1:5000';

export const api = {
  login: (username, password) =>
    fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }).then((res) => res.json()),

  register: (username, password) =>
    fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }).then((res) => res.json()),

  indexRepository: `${API_BASE_URL}/index_repository`,
  repositoryAnalysis: `${API_BASE_URL}/repositoryanalysis`,

  getGitHubRepos: (accessToken) =>
    fetch(`${API_BASE_URL}/github/repos`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then((res) => res.json()),
};
export const getGitHubRepos = (accessToken: string) =>
  fetch(`${API_BASE_URL}/github/repos`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  }).then((res) => res.json());

export const indexRepository = (apiKey: string, repository: string, branch: string) =>
  fetch(`${API_BASE_URL}/repositories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'API-Key': apiKey },
    body: JSON.stringify({ repository, branch }),
  }).then((res) => res.json());
