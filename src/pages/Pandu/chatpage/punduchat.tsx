"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageSquare,
  ChevronRight,
  CopyIcon,
  Check,
  Download,
  Send,
  Sparkles,
  Loader2,
  ChevronDown as ChevronDownIcon,
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import Header from "../../../components/Header1";
import LeftSidebar from "./components/LeftSidebar";
import {
  getFullResponse,
  getProjectRecommendationQuestions,
  getConversationHistory,
  addConversationEntry,
} from "../../../api/wren";
import toast from "react-hot-toast";
import AnswerDisplay from "./components/AnswerDisplay";

export interface MessageType {
  isAnswer?: boolean;
  content?: string;
  answerText?: string;
  sqlQuery?: string;
  chartDetails?: any;
}

export interface Conversation {
  id: string;
  messages: MessageType[];
  lastUpdated: number;
  projectname?: string;
  questionPreview?: string;
  branch?: string;
  repositoryname?: string;
}

// Dummy recommended questions.
const dummyRecommendations = [
  { question: "What is the employee count per year?" },
  { question: "Which departments have the highest salaries?" },
  { question: "How many employees are in each department?" },
];

const buildDynamicChartSpecFromAnswer = (answer: string) => {
  const data: { label: string; value: number }[] = [];
  const regex = /([^:\n]+):\s*([\d,]+)/g;
  let match;
  while ((match = regex.exec(answer)) !== null) {
    const label = match[1].trim();
    const valueStr = match[2].replace(/,/g, "");
    const value = Number.parseFloat(valueStr);
    if (!isNaN(value) && label) {
      data.push({ label, value });
    }
  }
  if (data.length === 0) return null;
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Dynamic Chart",
    data: { values: data },
    mark: "bar",
    encoding: {
      x: { field: "label", type: "ordinal", title: "Label" },
      y: { field: "value", type: "quantitative", title: "Value" },
    },
    title: "Data Visualization",
  };
};

const POLL_INTERVAL = 3000;
const MAX_POLLS = 30;

const generateConversationId = () =>
  Date.now().toString() + "-" + Math.random().toString(36).substr(2, 9);

async function pollForFullResponse(question: string) {
  let finished = false;
  let finalAnswerText = "";
  let sqlQuery = "";
  let pollCount = 0;
  while (!finished) {
    pollCount++;
    if (pollCount > MAX_POLLS) {
      throw new Error("Timed out waiting for response. Please try again later.");
    }
    const response = await getFullResponse(question);
    console.log("Polled response:", response);
    const task = response?.data?.threadResponse || response?.data?.askingTask;
    if (!task) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      continue;
    }
    if (task.status === "FAILED" || task.status === "CANCELLED") {
      const errMsg =
        task.error?.message ||
        "Task failed. Please provide more details in your question.";
      throw new Error(errMsg);
    }
    const answerDetail = task.answerDetail;
    if (answerDetail?.status === "FINISHED") {
      finalAnswerText = answerDetail.content || "No answer provided.";
      sqlQuery = task.sql || "No SQL query available.";
      finished = true;
      break;
    } else {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
    }
  }
  const fallbackSpec = buildDynamicChartSpecFromAnswer(finalAnswerText);
  const chartDetails = fallbackSpec
    ? {
        chartType: "BAR",
        chartSchema: fallbackSpec,
        description: "Chart generated from answer text.",
      }
    : null;
  return { finalAnswerText, sqlQuery, chartDetails };
}

const PanduChat: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedQuestions, setRecommendedQuestions] = useState<
    { question: string; category?: string; sql?: string }[]
  >([]);

  // State for drop-up (selected tables)
  const [showTableDropdown, setShowTableDropdown] = useState(false);

  // Load selected tables from localStorage
  const [selectedTables] = useState<string[]>(() => {
    const stored = localStorage.getItem("selectedTables");
    return stored ? JSON.parse(stored) : [];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get or create current conversation (includes branch and repositoryname).
  const currentConversation = useCallback((): Conversation => {
    const conv = conversations.find((c) => c.id === currentConversationId);
    if (conv) return conv;
    const newConv: Conversation = {
      id: generateConversationId(),
      messages: [],
      lastUpdated: Date.now(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
    return newConv;
  }, [conversations, currentConversationId]);

  // Fetch conversation history on mount.
  useEffect(() => {
    const userId = sessionStorage.getItem("user_id") || "0";
    console.log("Fetching conversation history for user_id:", userId);
    getConversationHistory(userId)
      .then((data) => {
        const convs: Conversation[] = data
          .filter((c: any) => c.question && c.answer)
          .map((c: any) => {
            let parsedAnswer;
            try {
              parsedAnswer = JSON.parse(c.answer);
            } catch {
              parsedAnswer = { finalAnswerText: c.answer, sqlQuery: "" };
            }
            const fallbackSpec = buildDynamicChartSpecFromAnswer(parsedAnswer.finalAnswerText);
            const chartDetails = fallbackSpec
              ? {
                  chartType: "BAR",
                  chartSchema: fallbackSpec,
                  description: "Chart generated from answer text.",
                }
              : null;
            return {
              id: c.id.toString(),
              messages: [
                { content: c.question },
                {
                  isAnswer: true,
                  answerText: parsedAnswer.finalAnswerText,
                  sqlQuery: parsedAnswer.sqlQuery,
                  chartDetails,
                },
              ],
              lastUpdated: new Date(c.timestamp).getTime(),
              projectname: c.projectname,
              branch: c.branchname,
              repositoryname: c.repositoryname,
              questionPreview:
                c.question.length > 30 ? c.question.substring(0, 30) + "..." : c.question,
            };
          });
        setConversations(convs);
        if (convs.length > 0) {
          setCurrentConversationId(convs[0].id);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch conversation history:", error);
        toast.error("Failed to fetch conversation history");
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("conversationHistory", JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation().messages]);

  const updateConversation = (updatedConv: Conversation) => {
    setConversations((prev) => {
      const others = prev.filter((c) => c.id !== updatedConv.id);
      return [updatedConv, ...others].sort((a, b) => b.lastUpdated - a.lastUpdated);
    });
  };

  const fetchRecommendedQuestions = async () => {
    try {
      const recResponse = await getProjectRecommendationQuestions();
      const recTask = recResponse?.data?.getProjectRecommendationQuestions;
      if (recTask && recTask.status === "FINISHED" && recTask.questions?.length) {
        setRecommendedQuestions(recTask.questions);
      } else {
        setRecommendedQuestions(dummyRecommendations);
      }
    } catch (error) {
      console.error("Error fetching recommended questions:", error);
      setRecommendedQuestions(dummyRecommendations);
    }
  };

  useEffect(() => {
    fetchRecommendedQuestions();
  }, []);

  const handleAsk = async () => {
    if (!inputText.trim()) return;
    if (selectedTables.length === 0) {
      toast.error("No selected tables found. Please complete your connection setup and refresh the page.");
      return;
    }
    setIsLoading(true);
    const userQuestion = inputText;
    const contextPrefix = `Selected Tables: ${selectedTables.join(", ")}. `;
    const fullQuestion = contextPrefix + inputText;
    const conv = currentConversation();

    const userMsg: MessageType = { content: userQuestion };
    const processingMsg: MessageType = { content: "Processing..." };
    const updatedMessages = [...conv.messages, userMsg, processingMsg];
    const updatedConv: Conversation = { ...conv, messages: updatedMessages, lastUpdated: Date.now() };
    updateConversation(updatedConv);

    try {
      const { finalAnswerText, sqlQuery, chartDetails } = await pollForFullResponse(fullQuestion);
      const answerMsg: MessageType = {
        isAnswer: true,
        answerText: finalAnswerText,
        sqlQuery,
        chartDetails,
      };
      const finalMsgs = [...updatedConv.messages.slice(0, -1), answerMsg];

      const modelingDataStr = localStorage.getItem("modelingData");
      const projectname = modelingDataStr ? JSON.parse(modelingDataStr).projectName : "Default Project";
      const repositoryname = modelingDataStr ? JSON.parse(modelingDataStr).connectionDetails.hostname : "";
      const branch = modelingDataStr ? JSON.parse(modelingDataStr).connectionDetails.databaseName : "";

      const finalConv: Conversation = {
        ...updatedConv,
        messages: finalMsgs,
        lastUpdated: Date.now(),
        projectname,
        questionPreview: userQuestion.length > 30 ? userQuestion.substring(0, 30) + "..." : userQuestion,
      };
      updateConversation(finalConv);

      const user_id = Number(sessionStorage.getItem("user_id")) || 0;
      await addConversationEntry({
        user_id,
        chat_type: "wren ai",
        question: userQuestion,
        projectname,
        repositoryname,
        branch,
        answer: JSON.stringify({
          finalAnswerText,
          sqlQuery,
        }),
      });
      fetchRecommendedQuestions();
    } catch (error: any) {
      console.error("Error fetching full response:", error);
      const errorMsg: MessageType = { content: "Error fetching response. Please try again later." };
      const finalMsgs = [...updatedConv.messages.slice(0, -1), errorMsg];
      const finalConv: Conversation = { ...updatedConv, messages: finalMsgs, lastUpdated: Date.now() };
      updateConversation(finalConv);
      if (error.message.includes("provide more details")) {
        toast.error("Your query is ambiguous. Please add more details.");
      } else {
        toast.error(error.message || "Failed to get response. Please try again.");
      }
    } finally {
      setIsLoading(false);
      setInputText("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleCopyAllHistory = () => {
    const conv = currentConversation();
    const fullText = conv.messages
      .map((m) =>
        m.isAnswer
          ? `Answer:\n${m.answerText}\nSQL:\n${m.sqlQuery}`
          : m.content
      )
      .join("\n\n");
    navigator.clipboard.writeText(fullText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
    toast.success("Conversation copied to clipboard");
  };

 
  const handleExportFullHistory= async () => {
    const conversationElement = document.getElementById("conversation-container");
    if (!conversationElement) {
      toast.error("Conversation container not found");
      return;
    }
  
    try {
      // Show a loading notification
      const loadingToast = toast.loading("Preparing PDF export...");
  
      // Clone the conversation element to capture all rendered styles
      const clonedElement = conversationElement.cloneNode(true) as HTMLElement;
      // Remove scroll restrictions from the clone
      clonedElement.style.height = "auto";
      clonedElement.style.maxHeight = "none";
      clonedElement.style.overflow = "visible";
  
      // Create a temporary off-screen container to hold the clone
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "fixed";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "0";
      tempContainer.style.width = conversationElement.offsetWidth + "px";
      tempContainer.appendChild(clonedElement);
      document.body.appendChild(tempContainer);
  
      // Allow time for the browser to apply styles
      await new Promise((resolve) => setTimeout(resolve, 300));
  
      // Use html2canvas to capture the cloned element as a canvas image
      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#f9fafb", // Match the UI background color
      });
  
      // Clean up the temporary container
      document.body.removeChild(tempContainer);
  
      // Create a new PDF document using jsPDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = pdfWidth / canvasWidth;
      const scaledHeight = canvasHeight * ratio;
  
      if (scaledHeight <= pdfHeight) {
        // If the entire content fits on one page, add it directly
        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, scaledHeight);
      } else {
        // Multi-page support: crop the canvas into slices
        const pageCount = Math.ceil(scaledHeight / pdfHeight);
        for (let i = 0; i < pageCount; i++) {
          const sourceY = i * (pdfHeight / ratio);
          const sliceHeight = Math.min(pdfHeight / ratio, canvasHeight - sourceY);
  
          // Create a temporary canvas to hold the slice
          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvasWidth;
          pageCanvas.height = sliceHeight;
          const pageContext = pageCanvas.getContext("2d");
          pageContext?.drawImage(
            canvas,
            0,
            sourceY,
            canvasWidth,
            sliceHeight,
            0,
            0,
            canvasWidth,
            sliceHeight
          );
  
          const pageImgData = pageCanvas.toDataURL("image/png");
          pdf.addImage(pageImgData, "PNG", 0, 0, pdfWidth, sliceHeight * ratio);
          if (i < pageCount - 1) {
            pdf.addPage();
          }
        }
      }
  
      // Add page numbers at the bottom of each page
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(`Page ${i} of ${totalPages}`, pdfWidth - 80, pdfHeight - 10);
      }
  
      // Optionally set PDF properties
      pdf.setProperties({
        title: "Full Conversation History",
        subject: "Database Queries and Answers",
        creator: "Pandu Database Chat",
        author: "User",
      });
  
      // Save the PDF file
      pdf.save("full-conversation-history.pdf");
  
      toast.dismiss(loadingToast);
      toast.success("Full conversation exported to PDF");
    } catch (error: any) {
      console.error("PDF export failed:", error);
      toast.error("Failed to export conversation: " + (error.message || "Unknown error"));
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const handleNewChat = () => {
    const newConv: Conversation = {
      id: generateConversationId(),
      messages: [],
      lastUpdated: Date.now(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
    setInputText("");
  };

  const handleSelectConversation = (conv: Conversation) => {
    setCurrentConversationId(conv.id);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col overflow-hidden relative">
        {/* Fixed Header */}
        <div className="w-full fixed top-0 left-0 z-50">
          <Header />
        </div>
        <style>{`
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .no-overscroll { overscroll-behavior: none; }
          .message-appear { animation: fadeIn 0.3s ease-out; }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
        <div className="flex h-screen w-full bg-purple-50 relative">
          {/* Left Sidebar */}
          <div className={`transition-all duration-300 ${isSidebarOpen ? "w-72" : "w-0"} overflow-hidden`}>
          <LeftSidebar
  conversations={conversations}
  currentConversationId={currentConversation().id}
  onNewChat={handleNewChat}
  onSelectConversation={handleSelectConversation}
  onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
  isLoading={isLoading}
  branch={currentConversation().branch}
  repositoryname={currentConversation().repositoryname}
  userId={sessionStorage.getItem("user_id") || "0"}  // Pass userId here
/>

          </div>
          {/* Sidebar Hover Button */}
          {!isSidebarOpen && (
            <button
              onMouseEnter={() => setIsSidebarOpen(true)}
              onClick={() => setIsSidebarOpen(true)}
              className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white border border-purple-200 p-2 rounded-r-lg shadow-md hover:bg-purple-50 transition-colors z-10"
              title="Open Sidebar"
            >
              <ChevronRight className="w-5 h-5 text-purple-600" />
            </button>
          )}
          {/* Main Chat Section */}
          <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto pt-4 mt-16 px-4">
            {/* Conversation Messages Container */}
            <div
              id="conversation-container"
              className="flex-1 overflow-y-auto p-4 hide-scrollbar bg-white rounded-lg shadow-sm border border-purple-100"
            >
              <div className="flex justify-end items-center space-x-1 p-2 mb-2">
                <button
                  onClick={handleCopyAllHistory}
                  className="p-2 rounded-full hover:bg-purple-100 transition-colors"
                  title="Copy full conversation"
                  disabled={currentConversation().messages.length === 0}
                >
                  {copySuccess ? (
                    <Check className="w-5 h-5 text-purple-600" />
                  ) : (
                    <CopyIcon className="w-5 h-5 text-purple-600" />
                  )}
                </button>
                <button
                  onClick={handleExportFullHistory}
                  className="p-2 rounded-full hover:bg-purple-100 transition-colors"
                  title="Export full conversation to PDF"
                  disabled={currentConversation().messages.length === 0}
                >
                  <Download className="w-5 h-5 text-purple-600" />
                </button>
              </div>
              {currentConversation().messages.length > 0 ? (
                <div className="space-y-4">
                  {currentConversation().messages.map((msg, index) =>
                    !msg.isAnswer ? (
                      msg.content === "Processing..." ? (
                        <div key={index} className="mb-4 message-appear flex justify-start">
                          <div className="max-w-[80%] p-3 rounded-lg shadow-sm bg-white border border-purple-200 text-gray-800">
                            <div className="flex items-center space-x-2 text-purple-600">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Pandu is Thinking...</span>
                            </div>
                          </div>
                        </div>
                      ) : msg.content === "Error fetching response. Please try again later." ? (
                        <div key={index} className="mb-4 message-appear flex justify-start">
                          <div className="max-w-[80%] p-3 rounded-lg shadow-sm bg-purple-100 text-purple-800">
                            {msg.content}
                          </div>
                        </div>
                      ) : (
                        <div key={index} className="mb-4 message-appear flex justify-end">
                          <div className="max-w-[80%] p-3 rounded-lg shadow-sm bg-purple-100 text-purple-800">
                            {msg.content}
                          </div>
                        </div>
                      )
                    ) : (
                      <div key={index} className="mb-4">
                        <AnswerDisplay
                          answerText={msg.answerText || ""}
                          sqlQuery={msg.sqlQuery || ""}
                          chartDetails={msg.chartDetails}
                        />
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="mt-8 text-center">
                  <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-purple-800 mb-1">Start a conversation</h3>
                  <p className="text-purple-600 text-sm max-w-md mx-auto">
                    Ask questions about your database to get insights about its structure and data.
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Recommended Questions Row (centered) */}
            {!isLoading && (
              <div className="mt-4 flex flex-wrap justify-center gap-2 bg-transparent">
                {(recommendedQuestions.length > 0 ? recommendedQuestions : dummyRecommendations).map((rq, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputText(rq.question);
                      inputRef.current?.focus();
                    }}
                    className="inline-flex items-center px-4 py-2 border border-purple-200 rounded-md bg-transparent text-sm text-purple-700 hover:bg-purple-50 transition-all"
                  >
                    <MessageSquare className="w-4 h-4 mr-1.5 text-purple-500" />
                    {rq.question}
                  </button>
                ))}
              </div>
            )}

            {/* Chat Input Row */}
            <div className="p-4">
              <div className="flex items-center border border-purple-200 rounded-lg bg-transparent focus-within:ring-2 focus-within:ring-purple-300">
                {/* Selected Tables Drop-up Button */}
                {/* <div className="relative mr-4">
                  <button
                    onClick={() => setShowTableDropdown(!showTableDropdown)}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                  >
                    Selected Tables
                    <ChevronDownIcon className="ml-2 w-4 h-4 transform rotate-180" />
                  </button>
                  {showTableDropdown && (
                    <div className="absolute bottom-full mb-2 w-56 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg z-10 transition-opacity duration-300">
                      {selectedTables.length > 0 ? (
                        selectedTables.map((table, idx) => (
                          <div key={idx} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-default">
                            {table}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">No tables selected</div>
                      )}
                    </div>
                  )}
                </div> */}
                {/* Chat Input & Ask Button */}
                <div className="flex-1 flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask to explore your data"
                    className="flex-1 px-4 py-3 text-purple-800 placeholder-purple-400 outline-none"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleAsk}
                    disabled={isLoading || !inputText.trim()}
                    className={`flex items-center justify-center px-6 py-3 bg-purple-600 text-white transition-colors rounded-r-lg ${
                      isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-purple-700"
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-1" />
                        Ask
                      </>
                    )}
                  </button>
                </div>
              </div>
              <p className="text-xs text-purple-600 mt-2 text-center">
                Press Enter to send your message
              </p>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default PanduChat;
