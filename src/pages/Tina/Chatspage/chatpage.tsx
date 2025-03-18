import { useState, useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import Header from "../../../components/Header";
import LeftSidebar from "./components/LeftSidebar";
import ReadmeModal from "./components/ReadmeModal";
import MainContent from "./components/MainContent";

// Updated interface includes repositoryname and branchname.
interface ConversationResponse {
  id: number;
  question: string;
  answer: string;
  repositoryname: string;
  branchname: string;
}

const suggestions = [
  { title: "", text: "what is the purpose of this project ?" },
  { title: "", text: "What are the key features of the project?" },
  { title: "", text: "Data flow of the project ?" },
];

const ChatPage: React.FC = () => {
  const [selectedRepo, setSelectedRepo] = useState<{
    name: string;
    branch: string;
    tree?: any[];
  }>({ name: "MyRepo", branch: "main" });

  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; text: string }>>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewChat, setIsNewChat] = useState(true);
  // Conversation history now holds repositoryname and branchname as well.
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ id: number; question: string; answer: string; repositoryname: string; branchname: string }>
  >([]);
  // Track current conversation ID (if loaded/created) so that subsequent questions update it
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);

  // README modal state
  const [readmeContent, setReadmeContent] = useState("");
  const [showReadmeModal, setShowReadmeModal] = useState(false);

  // userId from session storage
  const [userId, setUserId] = useState<number | null>(null);
  useEffect(() => {
    const storedUserId = sessionStorage.getItem("userId");
    if (storedUserId) {
      setUserId(Number(storedUserId));
    }
  }, []);

  // Load selected repository from session storage.
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

  // Fetch conversation history and filter based on selected repository and branch.
  useEffect(() => {
    if (userId !== null) {
      axios
        .get("http://127.0.0.1:5000/get_questions", {
          params: { user_id: userId },
        })
        .then((res) => {
          const conversationData = (res.data as ConversationResponse[]).map(
            (item: ConversationResponse) => ({
              id: item.id,
              question: item.question,
              answer: item.answer,
              repositoryname: item.repositoryname,
              branchname: item.branchname,
            })
          );
          const filteredData = conversationData.filter(
            (item) =>
              item.repositoryname === selectedRepo.name &&
              item.branchname === selectedRepo.branch
          );
          setConversationHistory(filteredData);
        })
        .catch((err) => {
          console.error("Error fetching conversation history", err);
        });
    }
  }, [userId, selectedRepo]);

  // Ref for scrolling the messages container.
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Modified simulateTypingEffect to accept a callback after completion
  const simulateTypingEffect = (fullText: string, callback?: () => void) => {
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
          updatedMessages[updatedMessages.length - 1] = { role: "bot", text: displayedText };
          return updatedMessages;
        });
      } else {
        clearInterval(interval);
        setIsLoading(false);
        if (callback) callback();
      }
    }, 5);
  };

  // Call this after each complete bot response to save/update the conversation.
  const updateBackendConversation = async () => {
    if (userId !== null && messages.length > 0) {
      const userConversation = messages
        .filter((msg) => msg.role === "user")
        .map((msg) => msg.text)
        .join("|||");
      const botConversation = messages
        .filter((msg) => msg.role === "bot")
        .map((msg) => msg.text)
        .join("|||");
      try {
        if (currentConversationId === null) {
          // Retrieve latest conversation id
          const res = await axios.get("http://127.0.0.1:5000/get_questions", {
            params: { user_id: userId },
          });
          const conversationData = (res.data as ConversationResponse[]).filter(
            (item) =>
              item.repositoryname === selectedRepo.name &&
              item.branchname === selectedRepo.branch
          );
          if (conversationData.length > 0) {
            // Assume the most recent conversation is the current one.
            setCurrentConversationId(conversationData[conversationData.length - 1].id);
          }
        } else {
          // Existing conversation: update via PATCH endpoint
          await axios.patch("http://127.0.0.1:5000/update_question", {
            user_id: userId,
            chat_type: "tina",
            question: userConversation,
            answer: botConversation,
            projectname: selectedRepo.name,
            repositoryname: selectedRepo.name,
            branch: selectedRepo.branch,
          });
        }
      } catch (error) {
        console.error("Error updating conversation:", error);
      }
    }
  };

  // Ask a question.
  const handleAsk = async () => {
    if (inputText.trim() === "") return;

    setIsLoading(true);
    setIsNewChat(false);

    // Add user question and a placeholder for bot response
    const userMsg = { role: "user", text: inputText };
    setMessages((prev) => [...prev, userMsg]);
    setMessages((prev) => [...prev, { role: "bot", text: "" }]);

    try {
      const res = await axios.post("http://127.0.0.1:5000/api/repositoryanalysis", {
        repository: selectedRepo.name,
        branch: selectedRepo.branch,
        query: inputText,
      });
      const { content } = res.data;
      setReadmeContent(content);
      // Once bot response is complete, update the backend conversation.
      simulateTypingEffect(content, updateBackendConversation);
    } catch (error) {
      console.error("Error fetching query response:", error);
      toast.error("Error fetching query response");
      setMessages((prev) => prev.slice(0, -1));
      setIsLoading(false);
    }
    setInputText("");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Load a conversation from history.
  const handleLoadConversation = (
    item: { id: number; question: string; answer: string; repositoryname: string; branchname: string }
  ) => {
    const userPairs = item.question.split("|||");
    const botPairs = item.answer.split("|||");
    const loadedMessages: Array<{ role: string; text: string }> = [];
    for (let i = 0; i < userPairs.length; i++) {
      loadedMessages.push({ role: "user", text: userPairs[i] });
      if (botPairs[i]) {
        loadedMessages.push({ role: "bot", text: botPairs[i] });
      }
    }
    setMessages(loadedMessages);
    setIsNewChat(false);
    setCurrentConversationId(item.id);
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
    toast.success("Conversation copied to clipboard");
  };

  // Updated export function to capture the conversation container and save it as a PDF
  const handleExportFullHistory = () => {
    const conversationElement = document.getElementById("conversation-container");
    if (conversationElement) {
      html2canvas(conversationElement, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "pt", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const ratio = imgProps.width / imgProps.height;
        let imgWidth = pdfWidth;
        let imgHeight = pdfWidth / ratio;
        if (imgHeight > pdfHeight) {
          imgHeight = pdfHeight;
          imgWidth = pdfHeight * ratio;
        }
        const marginX = (pdfWidth - imgWidth) / 2;
        const marginY = (pdfHeight - imgHeight) / 2;
        pdf.addImage(imgData, "PNG", marginX, marginY, imgWidth, imgHeight);
        pdf.save("conversation.pdf");
        toast.success("Conversation exported to PDF");
      });
    }
  };

  // KeyDown handler for the input field.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  // When "New Chat" is clicked, finalize the current conversation (if any) and clear the state.
  const handleNewChat = async () => {
    if (messages.length > 0 && userId !== null) {
      const userConversation = messages
        .filter((msg) => msg.role === "user")
        .map((msg) => msg.text)
        .join("|||");
      const botConversation = messages
        .filter((msg) => msg.role === "bot")
        .map((msg) => msg.text)
        .join("|||");
      try {
        if (currentConversationId === null) {
          await axios.post("http://127.0.0.1:5000/add_question", {
            user_id: userId,
            chat_type: "tina",
            question: userConversation,
            answer: botConversation,
            projectname: selectedRepo.name,
            repositoryname: selectedRepo.name,
            branch: selectedRepo.branch,
          });
        } else {
          await axios.patch("http://127.0.0.1:5000/update_question", {
            user_id: userId,
            chat_type: "tina",
            question: userConversation,
            answer: botConversation,
            projectname: selectedRepo.name,
            repositoryname: selectedRepo.name,
            branch: selectedRepo.branch,
          });
        }
        toast.success("Conversation saved to history.");
        // Refresh conversation history
        const res = await axios.get("http://127.0.0.1:5000/get_questions", {
          params: { user_id: userId },
        });
        const conversationData = (res.data as ConversationResponse[]).map(
          (item: ConversationResponse) => ({
            id: item.id,
            question: item.question,
            answer: item.answer,
            repositoryname: item.repositoryname,
            branchname: item.branchname,
          })
        );
        const filteredData = conversationData.filter(
          (item) =>
            item.repositoryname === selectedRepo.name &&
            item.branchname === selectedRepo.branch
        );
        setConversationHistory(filteredData);
      } catch (error) {
        console.error("Error updating conversation:", error);
        toast.error("Error updating conversation");
      }
    }
    // Clear conversation state for new chat
    setMessages([]);
    setInputText("");
    setIsNewChat(true);
    setCurrentConversationId(null);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative flex flex-col overflow-hidden">
        <div className="w-full fixed top-0 left-0 z-50">
          <Header />
        </div>
        <style>{`
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .no-overscroll { overscroll-behavior: none; }
          .spinner { border: 3px solid rgba(0, 128, 128, 0.1); width: 24px; height: 24px; border-radius: 50%; border-left-color: #20b2aa; animation: spin 1s ease infinite; display: inline-block; vertical-align: middle; margin-left: 8px; }
          @keyframes spin { to { transform: rotate(360deg); } }
          .message-appear { animation: fadeIn 0.3s ease-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
          .suggestion-popup { animation: popUp 0.5s ease-out; }
          @keyframes popUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        `}</style>
        <div className="flex h-screen w-full bg-teal-50 relative">
          <div className={`transition-all duration-300 ${isSidebarOpen ? "w-72" : "w-0"} overflow-hidden`}>
            <LeftSidebar
              repo={selectedRepo}
              history={conversationHistory}
              onNewChat={handleNewChat}
              onCopy={(text) => {
                setInputText(text);
                inputRef.current?.focus();
              }}
              onToggle={toggleSidebar}
              onEdit={() => {}}
              onDelete={() => {}}
              onRename={() => {}}
              onArchive={() => {}}
              onExport={handleExportFullHistory}
              onShowReadme={() => {
                if (readmeContent) {
                  setShowReadmeModal(true);
                } else {
                  toast.error("README content not available");
                }
              }}
              onHistorySelect={handleLoadConversation}
            />
          </div>
          {!isSidebarOpen && (
            <button
              onMouseEnter={toggleSidebar}
              onClick={toggleSidebar}
              className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white border border-green-200 p-2 rounded-r-lg shadow-md hover:bg-green-50 transition-colors z-10"
              title="Open Sidebar"
            >
              <ChevronRight className="w-5 h-5 text-green-600" />
            </button>
          )}
          <MainContent
            messages={messages}
            isNewChat={isNewChat}
            suggestions={suggestions}
            selectedRepo={selectedRepo}
            handleSuggestionClick={(text) => {
              setInputText(text);
              inputRef.current?.focus();
            }}
            handleCopyAllHistory={handleCopyAllHistory}
            copySuccess={copySuccess}
            handleExportFullHistory={handleExportFullHistory}
            messagesEndRef={messagesEndRef}
            inputRef={inputRef}
            inputText={inputText}
            isLoading={isLoading}
            handleKeyDown={handleKeyDown}
            handleAsk={handleAsk}
          />
        </div>
      </div>
      {showReadmeModal && (
        <ReadmeModal readmeContent={readmeContent} onClose={() => setShowReadmeModal(false)} />
      )}
    </>
  );
};

export default ChatPage;
