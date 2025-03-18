// src/pages/Pandu/ThreadDetails.tsx
import React, { useState } from "react";
import toast from "react-hot-toast";

// Helper: Fetch Thread Details (GetResponseId)
const fetchThreadDetails = async (threadId: number) => {
  const payload = {
    operationName: "Thread",
    variables: { threadId },
    query:
      "query Thread($threadId: Int!) {\n  thread(threadId: $threadId) {\n    id\n    responses {\n      id\n      question\n      sql\n      view {\n        id\n        name\n        statement\n        displayName\n        __typename\n      }\n      breakdownDetail {\n        queryId\n        status\n        description\n        steps {\n          summary\n          sql\n          cteName\n          __typename\n        }\n        error {\n          code\n          shortMessage\n          message\n          stacktrace\n          __typename\n        }\n        __typename\n      }\n      answerDetail {\n        queryId\n        status\n        content\n        numRowsUsedInLLM\n        error {\n          code\n          shortMessage\n          message\n          stacktrace\n          __typename\n        }\n        __typename\n      }\n      chartDetail {\n        queryId\n        status\n        description\n        chartType\n        chartSchema\n        error {\n          code\n          shortMessage\n          message\n          stacktrace\n          __typename\n        }\n        adjustment\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}",
  };

  const response = await fetch("http://localhost:5000/api/codesmell", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
};

// Helper: Fetch Thread Response Details (GetThreadResponseDetails_next_call_thread_response)
const fetchThreadResponseDetails = async (responseId: number) => {
  const payload = {
    operationName: "ThreadResponse",
    variables: { responseId },
    query:
      "query ThreadResponse($responseId: Int!) {\n  threadResponse(responseId: $responseId) {\n    id\n    threadId\n    question\n    sql\n    view {\n      id\n      name\n      statement\n      displayName\n      __typename\n    }\n    breakdownDetail {\n      queryId\n      status\n      description\n      steps {\n        summary\n        sql\n        cteName\n        __typename\n      }\n      error {\n        code\n        shortMessage\n        message\n        stacktrace\n        __typename\n      }\n      __typename\n    }\n    answerDetail {\n      queryId\n      status\n      content\n      numRowsUsedInLLM\n      error {\n        code\n        shortMessage\n        message\n        stacktrace\n        __typename\n      }\n      __typename\n    }\n    chartDetail {\n      queryId\n      status\n      description\n      chartType\n      chartSchema\n      error {\n        code\n        shortMessage\n        message\n        stacktrace\n        __typename\n      }\n      adjustment\n      __typename\n    }\n    __typename\n  }\n}",
  };

  const response = await fetch("http://localhost:5000/api/codesmell", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
};

// Helper: Fetch Recommended Questions (Last_Ques_Based_GetRelavantQuestions)
const fetchRecommendedQuestions = async (threadId: number) => {
  const payload = {
    operationName: "GetThreadRecommendationQuestions",
    variables: { threadId },
    query:
      "query GetThreadRecommendationQuestions($threadId: Int!) {\n  getThreadRecommendationQuestions(threadId: $threadId) {\n    status\n    questions {\n      question\n      category\n      sql\n      __typename\n    }\n    error {\n      code\n      shortMessage\n      message\n      stacktrace\n      __typename\n    }\n    __typename\n  }\n}",
  };

  const response = await fetch("http://localhost:5000/api/codesmell", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
};

const ThreadDetails: React.FC = () => {
  const [threadIdInput, setThreadIdInput] = useState("");
  const [threadResponseId, setThreadResponseId] = useState("");
  const [recommendedThreadId, setRecommendedThreadId] = useState("");
  const [threadData, setThreadData] = useState<any>(null);
  const [threadResponseData, setThreadResponseData] = useState<any>(null);
  const [recommendedQuestions, setRecommendedQuestions] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFetchThread = async () => {
    if (!threadIdInput) {
      toast.error("Please enter a thread ID.");
      return;
    }
    setLoading(true);
    try {
      const result = await fetchThreadDetails(Number(threadIdInput));
      console.log("GetResponseId API Response:", result);
      if (result.data && result.data.thread) {
        setThreadData(result.data.thread);
        toast.success("Thread details fetched.");
      } else {
        toast.error("Failed to fetch thread details.");
      }
    } catch (error) {
      console.error("Error fetching thread details:", error);
      toast.error("Error fetching thread details.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchThreadResponse = async () => {
    if (!threadResponseId) {
      toast.error("Please enter a response ID.");
      return;
    }
    setLoading(true);
    try {
      const result = await fetchThreadResponseDetails(Number(threadResponseId));
      console.log("ThreadResponse API Response:", result);
      if (result.data && result.data.threadResponse) {
        setThreadResponseData(result.data.threadResponse);
        toast.success("Thread response details fetched.");
      } else {
        toast.error("Failed to fetch thread response details.");
      }
    } catch (error) {
      console.error("Error fetching thread response details:", error);
      toast.error("Error fetching thread response details.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchRecommendedQuestions = async () => {
    if (!recommendedThreadId) {
      toast.error("Please enter a thread ID for recommendations.");
      return;
    }
    setLoading(true);
    try {
      const result = await fetchRecommendedQuestions(Number(recommendedThreadId));
      console.log("Recommended Questions API Response:", result);
      if (
        result.data &&
        result.data.getThreadRecommendationQuestions &&
        result.data.getThreadRecommendationQuestions.questions
      ) {
        setRecommendedQuestions(result.data.getThreadRecommendationQuestions.questions);
        toast.success("Recommended questions fetched.");
      } else {
        toast.error("Failed to fetch recommended questions.");
      }
    } catch (error) {
      console.error("Error fetching recommended questions:", error);
      toast.error("Error fetching recommended questions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Thread Details & Response Data</h1>

      {/* Section 1: GetResponseId */}
      <div className="p-6 bg-white rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-2">Get Response ID (Thread Details)</h2>
        <p className="text-sm text-gray-600 mb-2">
          Request: A query (Thread) with a specific thread ID fetches detailed thread information.
        </p>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={threadIdInput}
            onChange={(e) => setThreadIdInput(e.target.value)}
            placeholder="Enter thread ID (e.g., 5)"
            className="border p-2 rounded w-32"
          />
          <button
            onClick={handleFetchThread}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Fetch Thread
          </button>
        </div>
        {threadData && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="font-medium">Response:</h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(threadData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Section 2: GetThreadResponseDetails */}
      <div className="p-6 bg-white rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-2">Get Thread Response Details</h2>
        <p className="text-sm text-gray-600 mb-2">
          Request: A query (ThreadResponse) with a specific response ID fetches detailed response data.
        </p>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={threadResponseId}
            onChange={(e) => setThreadResponseId(e.target.value)}
            placeholder="Enter response ID (e.g., 12)"
            className="border p-2 rounded w-32"
          />
          <button
            onClick={handleFetchThreadResponse}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Fetch Response Details
          </button>
        </div>
        {threadResponseData && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="font-medium">Response Details:</h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(threadResponseData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Section 3: GetThreadRecommendationQuestions */}
      <div className="p-6 bg-white rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-2">Get Recommended Questions</h2>
        <p className="text-sm text-gray-600 mb-2">
          Request: A query (GetThreadRecommendationQuestions) based on a thread ID returns additional recommended questions.
        </p>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={recommendedThreadId}
            onChange={(e) => setRecommendedThreadId(e.target.value)}
            placeholder="Enter thread ID for recommendations (e.g., 5)"
            className="border p-2 rounded w-32"
          />
          <button
            onClick={handleFetchRecommendedQuestions}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Fetch Recommendations
          </button>
        </div>
        {recommendedQuestions && recommendedQuestions.length > 0 ? (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="font-medium">Recommended Questions:</h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(recommendedQuestions, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-600">No recommended questions available.</p>
        )}
      </div>
    </div>
  );
};

export default ThreadDetails;
