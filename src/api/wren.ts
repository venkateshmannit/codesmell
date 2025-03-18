export const API_BASE_URL = "http://127.0.0.1:5000";

/**
 * getFullResponse()
 * Sends a POST request to /api/get_full_response with the provided question.
 */
export const getFullResponse = async (question: string) => {
  console.log("Sending question:", question);
  const payload = { question };
  const response = await fetch(`${API_BASE_URL}/api/get_full_response`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorPayload = await response.json();
    throw new Error(errorPayload.error || "Error fetching response");
  }
  return response.json();
};

/**
 * getProjectRecommendationQuestions()
 * Fetches recommended questions.
 */
export const getProjectRecommendationQuestions = async () => {
  const payload = {
    operationName: "GetProjectRecommendationQuestions",
    variables: {},
    query:
      "query GetProjectRecommendationQuestions {\n  getProjectRecommendationQuestions {\n    status\n    questions {\n      question\n      category\n      sql\n      __typename\n    }\n    error {\n      code\n      shortMessage\n      message\n      stacktrace\n      __typename\n    }\n    __typename\n  }\n}",
  };
  const response = await fetch(`${API_BASE_URL}/api/codesmell`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
};

/**
 * getConversationHistory()
 * Fetches the user's conversation history based on the user_id.
 * Note: The caller must pass the dynamic user_id.
 */
export const getConversationHistory = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/get_questions?user_id=${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch conversation history");
  }
  return response.json();
};

/**
 * addConversationEntry()
 * Stores a new conversation entry by calling /add_question.
 * The payload includes the user_id (which is dynamic).
 */
export const addConversationEntry = async (payload: {
  user_id: number;
  chat_type: string;
  question: string;
  projectname: string;
  repositoryname: string;
  branch: string;
  answer: string; // JSON string containing finalAnswerText and sqlQuery
}) => {
  console.log("Adding conversation entry with payload:", payload);
  const response = await fetch(`${API_BASE_URL}/add_question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error("Failed to add conversation entry: " + errorText);
  }
  return response.json();
};

export const api = {
  login: (username: string, password: string) =>
    fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }).then((res) => res.json()),
  register: (username: string, password: string) =>
    fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }).then((res) => res.json()),
  indexRepository: `${API_BASE_URL}/index_repository`,
  repositoryAnalysis: `${API_BASE_URL}/repositoryanalysis`,
  getGitHubRepos: (accessToken: string) =>
    fetch(`${API_BASE_URL}/github/repos`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then((res) => res.json()),
};
