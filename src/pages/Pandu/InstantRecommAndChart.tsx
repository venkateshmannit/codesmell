// src/pages/Pandu/InstantRecommAndChart.tsx
import React, { useState } from "react";
import toast from "react-hot-toast";

// ================================
// API FUNCTIONS (ideally in src/api/tables.ts)
// ================================

/**
 * CreateInstantRecommendedQuestions mutation.
 */
const createInstantRecommendedQuestionsAPI = async (
  previousQuestions: string[]
) => {
  const payload = {
    operationName: "CreateInstantRecommendedQuestions",
    variables: {
      data: { previousQuestions },
    },
    query:
      "mutation CreateInstantRecommendedQuestions($data: InstantRecommendedQuestionsInput!) {\n  createInstantRecommendedQuestions(data: $data) {\n    id\n    __typename\n  }\n}",
  };

  const response = await fetch("http://localhost:5000/api/codesmell", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
};

/**
 * InstantRecommendedQuestions query.
 */
const getInstantRecommendedQuestionsAPI = async (taskId: string) => {
  const payload = {
    operationName: "InstantRecommendedQuestions",
    variables: { taskId },
    query:
      "query InstantRecommendedQuestions($taskId: String!) {\n  instantRecommendedQuestions(taskId: $taskId) {\n    status\n    questions {\n      question\n      category\n      sql\n      __typename\n    }\n    error {\n      code\n      shortMessage\n      message\n      stacktrace\n      __typename\n    }\n    __typename\n  }\n}",
  };

  const response = await fetch("http://localhost:5000/api/codesmell", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
};

/**
 * CreateThreadResponse mutation.
 */
const createThreadResponseAPI = async (
  threadId: number,
  sql: string,
  question: string
) => {
  const payload = {
    operationName: "CreateThreadResponse",
    variables: {
      threadId,
      data: {
        sql,
        question,
      },
    },
    query:
      "mutation CreateThreadResponse($threadId: Int!, $data: CreateThreadResponseInput!) {\n  createThreadResponse(threadId: $threadId, data: $data) {\n    id\n    threadId\n    question\n    sql\n    view {\n      id\n      name\n      statement\n      displayName\n      __typename\n    }\n    breakdownDetail {\n      queryId\n      status\n      description\n      steps {\n        summary\n        sql\n        cteName\n        __typename\n      }\n      error {\n        code\n        shortMessage\n        message\n        stacktrace\n        __typename\n      }\n      __typename\n    }\n    answerDetail {\n      queryId\n      status\n      content\n      numRowsUsedInLLM\n      error {\n        code\n        shortMessage\n        message\n        stacktrace\n        __typename\n      }\n      __typename\n    }\n    chartDetail {\n      queryId\n      status\n      description\n      chartType\n      chartSchema\n      error {\n        code\n        shortMessage\n        message\n        stacktrace\n        __typename\n      }\n      adjustment\n      __typename\n    }\n    __typename\n  }\n}",
  };

  const response = await fetch("http://localhost:5000/api/codesmell", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
};

/**
 * GenerateThreadResponseChart mutation.
 */
const generateThreadResponseChartAPI = async (responseId: number) => {
  const payload = {
    operationName: "GenerateThreadResponseChart",
    variables: { responseId },
    query:
      "mutation GenerateThreadResponseChart($responseId: Int!) {\n  generateThreadResponseChart(responseId: $responseId) {\n    id\n    threadId\n    question\n    sql\n    view {\n      id\n      name\n      statement\n      displayName\n      __typename\n    }\n    breakdownDetail {\n      queryId\n      status\n      description\n      steps {\n        summary\n        sql\n        cteName\n        __typename\n      }\n      error {\n        code\n        shortMessage\n        message\n        stacktrace\n        __typename\n      }\n      __typename\n    }\n    answerDetail {\n      queryId\n      status\n      content\n      numRowsUsedInLLM\n      error {\n        code\n        shortMessage\n        message\n        stacktrace\n        __typename\n      }\n      __typename\n    }\n    chartDetail {\n      queryId\n      status\n      description\n      chartType\n      chartSchema\n      error {\n        code\n        shortMessage\n        message\n        stacktrace\n        __typename\n      }\n      adjustment\n      __typename\n    }\n    __typename\n  }\n}",
  };

  const response = await fetch("http://localhost:5000/api/codesmell", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
};

/**
 * previewDataForThreadResponseAPI - Simulates a GET preview request.
 */
const previewDataForThreadResponseAPI = async (responseId: number) => {
  // For demonstration, we'll use the same payload as previewDataAPI.
  const payload = {
    operationName: "PreviewData",
    variables: { where: { responseId } },
    query:
      "mutation PreviewData($where: PreviewDataInput!) {\n  previewData(where: $where)\n}",
  };

  const response = await fetch("http://localhost:5000/api/codesmell", {
    method: "POST", // or use GET if your backend supports it
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
};

// ================================
// Component: InstantRecommAndChart
// ================================
const InstantRecommAndChart: React.FC = () => {
  // State for Instant Recommendation
  const [prevQuestions, setPrevQuestions] = useState("");
  const [instantTaskId, setInstantTaskId] = useState("");
  const [instantRecommendations, setInstantRecommendations] = useState<any[]>([]);

  // State for Create Thread Response
  const [threadIdForResponse, setThreadIdForResponse] = useState("");
  const [responseSQL, setResponseSQL] = useState("");
  const [responseQuestion, setResponseQuestion] = useState("");
  const [threadResponseResult, setThreadResponseResult] = useState<any>(null);

  // State for Generate Chart
  const [chartResponseId, setChartResponseId] = useState("");
  const [chartResult, setChartResult] = useState<any>(null);

  // State for Preview Data (GET style)
  const [previewResponseId, setPreviewResponseId] = useState("");
  const [previewResult, setPreviewResult] = useState("");

  // ================================
  // Handlers
  // ================================

  // Create Instant Recommendations
  const handleCreateInstantRecommendations = async () => {
    // Convert comma-separated list to an array of questions.
    const questionsArray = prevQuestions.split(",").map((q) => q.trim()).filter(Boolean);
    if (questionsArray.length === 0) {
      toast.error("Please enter at least one previous question.");
      return;
    }
    try {
      const result = await createInstantRecommendedQuestionsAPI(questionsArray);
      console.log("CreateInstantRecommendedQuestions API Response:", result);
      if (result.data && result.data.createInstantRecommendedQuestions) {
        const taskId = result.data.createInstantRecommendedQuestions.id;
        setInstantTaskId(taskId);
        toast.success(`Instant recommendation task created! Task ID: ${taskId}`);
      } else {
        toast.error("Failed to create instant recommendation task.");
      }
    } catch (error) {
      console.error("Error creating instant recommendations:", error);
      toast.error("Error creating instant recommendations.");
    }
  };

  // Get Instant Recommended Questions
  const handleGetInstantRecommendations = async () => {
    if (!instantTaskId) {
      toast.error("Please enter a task ID.");
      return;
    }
    try {
      const result = await getInstantRecommendedQuestionsAPI(instantTaskId);
      console.log("InstantRecommendedQuestions API Response:", result);
      if (
        result.data &&
        result.data.instantRecommendedQuestions &&
        result.data.instantRecommendedQuestions.questions
      ) {
        setInstantRecommendations(result.data.instantRecommendedQuestions.questions);
        toast.success("Instant recommendations fetched.");
      } else {
        toast.error("Failed to fetch instant recommendations.");
      }
    } catch (error) {
      console.error("Error fetching instant recommendations:", error);
      toast.error("Error fetching instant recommendations.");
    }
  };

  // Create Thread Response (post new response)
  const handleCreateThreadResponse = async () => {
    if (!threadIdForResponse || !responseSQL || !responseQuestion) {
      toast.error("Please enter thread ID, SQL, and question.");
      return;
    }
    try {
      const result = await createThreadResponseAPI(
        Number(threadIdForResponse),
        responseSQL,
        responseQuestion
      );
      console.log("CreateThreadResponse API Response:", result);
      if (result.data && result.data.createThreadResponse) {
        setThreadResponseResult(result.data.createThreadResponse);
        toast.success(`Thread response created with ID: ${result.data.createThreadResponse.id}`);
      } else {
        toast.error("Failed to create thread response.");
      }
    } catch (error) {
      console.error("Error creating thread response:", error);
      toast.error("Error creating thread response.");
    }
  };

  // Generate Chart for Thread Response
  const handleGenerateChart = async () => {
    if (!chartResponseId) {
      toast.error("Please enter a response ID to generate chart.");
      return;
    }
    try {
      const result = await generateThreadResponseChartAPI(Number(chartResponseId));
      console.log("GenerateThreadResponseChart API Response:", result);
      if (result.data && result.data.generateThreadResponseChart) {
        setChartResult(result.data.generateThreadResponseChart);
        toast.success("Chart generated successfully.");
      } else {
        toast.error("Failed to generate chart.");
      }
    } catch (error) {
      console.error("Error generating chart:", error);
      toast.error("Error generating chart.");
    }
  };

  // Preview Data for a Thread Response (GET style)
  const handlePreviewData = async () => {
    if (!previewResponseId) {
      toast.error("Please enter a response ID to preview.");
      return;
    }
    try {
      const result = await previewDataForThreadResponseAPI(Number(previewResponseId));
      console.log("Preview Data API Response:", result);
      if (result.data && result.data.previewData) {
        setPreviewResult(result.data.previewData);
        toast.success("Preview data fetched.");
      } else {
        toast.error("Failed to fetch preview data.");
      }
    } catch (error) {
      console.error("Error fetching preview data:", error);
      toast.error("Error fetching preview data.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-10">
      <h1 className="text-3xl font-bold mb-4">Instant Recommendations & Chart Generation</h1>

      {/* Section 1: Create Instant Recommendations */}
      <div className="p-6 bg-white rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-2">Create Instant Recommendations</h2>
        <p className="text-sm text-gray-600 mb-2">
          Provide a list of previous questions (comma separated) to generate instant recommendations.
        </p>
        <input
          type="text"
          value={prevQuestions}
          onChange={(e) => setPrevQuestions(e.target.value)}
          placeholder="Enter previous questions, separated by commas"
          className="w-full border p-2 rounded mb-4"
        />
        <button
          onClick={handleCreateInstantRecommendations}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Create Instant Recommendations
        </button>
        {instantTaskId && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-700">
              Task created with ID: <span className="font-semibold">{instantTaskId}</span>
            </p>
          </div>
        )}
      </div>

      {/* Section 2: Get Instant Recommended Questions */}
      <div className="p-6 bg-white rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-2">Get Instant Recommended Questions</h2>
        <p className="text-sm text-gray-600 mb-2">
          Use the task ID from above to fetch recommended questions.
        </p>
        <input
          type="text"
          value={instantTaskId}
          onChange={(e) => setInstantTaskId(e.target.value)}
          placeholder="Enter task ID"
          className="w-full border p-2 rounded mb-4"
        />
        <button
          onClick={handleGetInstantRecommendations}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Get Recommendations
        </button>
        {instantRecommendations.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="font-medium">Recommended Questions:</h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(instantRecommendations, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Section 3: Create Thread Response */}
      <div className="p-6 bg-white rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-2">Create Thread Response</h2>
        <p className="text-sm text-gray-600 mb-2">
          Post a new response to a thread by providing the thread ID, SQL query, and the corresponding question.
        </p>
        <div className="flex flex-col space-y-4">
          <input
            type="number"
            value={threadIdForResponse}
            onChange={(e) => setThreadIdForResponse(e.target.value)}
            placeholder="Enter thread ID (e.g., 2)"
            className="border p-2 rounded"
          />
          <textarea
            value={responseSQL}
            onChange={(e) => setResponseSQL(e.target.value)}
            placeholder="Enter SQL query"
            className="border p-2 rounded h-24"
          />
          <input
            type="text"
            value={responseQuestion}
            onChange={(e) => setResponseQuestion(e.target.value)}
            placeholder="Enter your question"
            className="border p-2 rounded"
          />
          <button
            onClick={handleCreateThreadResponse}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Post Thread Response
          </button>
        </div>
        {threadResponseResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="font-medium">Thread Response Details:</h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(threadResponseResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Section 4: Generate Chart for Thread Response */}
      <div className="p-6 bg-white rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-2">Generate Chart for Thread Response</h2>
        <p className="text-sm text-gray-600 mb-2">
          Enter a response ID (e.g., 12) to generate a chart.
        </p>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={chartResponseId}
            onChange={(e) => setChartResponseId(e.target.value)}
            placeholder="Enter response ID"
            className="border p-2 rounded w-32"
          />
          <button
            onClick={handleGenerateChart}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Generate Chart
          </button>
        </div>
        {chartResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="font-medium">Chart Details:</h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(chartResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Section 5: Preview Data for Thread Response */}
      <div className="p-6 bg-white rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-2">Preview Data (Thread Response)</h2>
        <p className="text-sm text-gray-600 mb-2">
          Enter a response ID (e.g., 7) to preview data.
        </p>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={previewResponseId}
            onChange={(e) => setPreviewResponseId(e.target.value)}
            placeholder="Enter response ID"
            className="border p-2 rounded w-32"
          />
          <button
            onClick={handlePreviewData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Preview Data
          </button>
        </div>
        {previewResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="font-medium">Preview Result:</h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(previewResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstantRecommAndChart;
