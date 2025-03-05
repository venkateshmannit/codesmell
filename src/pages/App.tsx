"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import jsPDF from "jspdf"
import { useNavigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import { fetchGithubRepositories, queryRepository } from "./services/api"
import Sidebar from "./components/Sidebar"
import Header from "./components/Header"
import ChatMessages from "./components/ChatMessages"
import ChatInput from "./components/ChatInput"

// Types
type MessageSender = "user" | "ai"
type MessageStatus = "sending" | "sent" | "error"
type ConversationStage = "initial" | "repo_type" | "repo_selection" | "branch_selection" | "free_chat"

interface Reactions {
  thumbsUp?: boolean
  thumbsDown?: boolean
}

export interface Message {
  id: string
  content: string | React.ReactNode
  sender: MessageSender
  timestamp: Date
  status: MessageStatus
  reactions?: Reactions
}

export interface SuggestedQuestion {
  id: string
  text: string
}

export interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  unread: boolean
  messages: Message[]
}

export interface Repository {
  id: number
  name: string
  full_name: string
  default_branch: string
}

const App: React.FC = () => {
  // Auth context and navigation
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  // UI and chat state
  const [darkMode, setDarkMode] = useState<boolean>(false)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true)
  const [repoDropdownOpen, setRepoDropdownOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false)

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string>("")
  const [currentConversation, setCurrentConversation] = useState<Conversation>({
    id: "1",
    title: "New Chat",
    lastMessage: "",
    timestamp: new Date(),
    unread: false,
    messages: [],
  })

  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState<string>("")
  const [tokenCount, setTokenCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([])
  const [conversationStage, setConversationStage] = useState<ConversationStage>("initial")

  // Repository state
  const [selectedRepoType, setSelectedRepoType] = useState<string>("")
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [selectedRepository, setSelectedRepository] = useState<string>("")
  const [selectedBranch, setSelectedBranch] = useState<string>("")
  const [repoInputError, setRepoInputError] = useState<string>("")

  // Refs for textarea, messages scroll, search input
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev)
    // Apply or remove dark class to document for global styling
    if (!darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  // On mount or authentication change
  useEffect(() => {
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDarkMode(true)
      document.documentElement.classList.add("dark")
    }

    if (!isAuthenticated) {
      // Show initial AI message for unauthenticated users with login options
      const initialMessage: Message = {
        id: "1",
        content: "Please choose how you want to connect:",
        sender: "ai",
        timestamp: new Date(),
        status: "sent",
      }
      setMessages([initialMessage])
      setSuggestedQuestions([
        { id: "1", text: "Login with GitHub" },
        { id: "2", text: "Continue as Guest" },
      ])
      setConversationStage("initial")
    } else {
      // If authenticated, fetch repositories and show repo type options
      fetchUserRepositories()
    }

    // Add smooth scroll behavior to the document
    document.documentElement.style.scrollBehavior = "smooth"

    return () => {
      document.documentElement.style.scrollBehavior = ""
    }
  }, [isAuthenticated])

  // Fetch repositories if authenticated
  const fetchUserRepositories = async () => {
    if (!isAuthenticated) return
    try {
      setIsLoading(true)
      const repos = await fetchGithubRepositories()
      setRepositories(repos)
      const initialMessage: Message = {
        id: generateId(),
        content: `Welcome back, ${user?.username}! Please choose the repository type:`,
        sender: "ai",
        timestamp: new Date(),
        status: "sent",
      }
      setMessages([initialMessage])
      setSuggestedQuestions([
        { id: "1", text: "Public Repository" },
        { id: "2", text: "Your Repository" },
      ])
      setConversationStage("repo_type")
    } catch (error) {
      console.error("Error fetching repositories:", error)
      const errorMessage: Message = {
        id: generateId(),
        content: "Failed to fetch your repositories. Please try again later.",
        sender: "ai",
        timestamp: new Date(),
        status: "error",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 250)}px`
    }
  }, [textareaRef])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messagesEndRef])

  // Update token count based on input length
  useEffect(() => {
    setTokenCount(inputValue.length)
  }, [inputValue])

  // Group conversations by date for display in Sidebar
  const groupedConversations = conversations.reduce<Record<string, Conversation[]>>((groups, conv) => {
    const date = conv.timestamp.toLocaleDateString()
    if (!groups[date]) groups[date] = []
    groups[date].push(conv)
    return groups
  }, {})

  // Handle input change and clear any repo error
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    if (repoInputError) setRepoInputError("")
  }

  // Handle Enter key press to send message (without shift)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Helper to generate a unique ID for messages
  const generateId = () => {
    return Math.random().toString(36).substring(2, 11)
  }

  // Process user input based on current conversation stage
  const processUserInput = async (input: string) => {
    switch (conversationStage) {
      case "initial":
        if (input.toLowerCase() === "login with github" || input === "1") {
          // Redirect to GitHub login
          navigate("/auth/github")
          return messages
        } else if (input.toLowerCase() === "continue as guest" || input === "2") {
          setConversationStage("repo_type")
          const guestResponse: Message = {
            id: generateId(),
            content: "Please choose the repository type:",
            sender: "ai",
            timestamp: new Date(),
            status: "sent",
          }
          setSuggestedQuestions([
            { id: "1", text: "Public Repository" },
            { id: "2", text: "Your Repository" },
          ])
          return [...messages, guestResponse]
        } else {
          const errorResponse: Message = {
            id: generateId(),
            content: 'Please select either "Login with GitHub" or "Continue as Guest".',
            sender: "ai",
            timestamp: new Date(),
            status: "sent",
          }
          return [...messages, errorResponse]
        }

      case "repo_type":
        if (input.toLowerCase() === "public repository" || input === "1") {
          setSelectedRepoType("public")
          setConversationStage("repo_selection")
          setSuggestedQuestions([])
          const repoTypeResponse: Message = {
            id: generateId(),
            content: 'Please enter the repository path in format "username/repo_name":',
            sender: "ai",
            timestamp: new Date(),
            status: "sent",
          }
          return [...messages, repoTypeResponse]
        } else if (input.toLowerCase() === "your repository" || input === "2") {
          setSelectedRepoType("user")
          setConversationStage("repo_selection")
          if (isAuthenticated && repositories.length > 0) {
            setSuggestedQuestions(
              repositories.map((repo) => ({
                id: `repo-${repo.id}`,
                text: repo.full_name,
              })),
            )
          } else {
            setSuggestedQuestions([])
          }
          const repoTypeResponse: Message = {
            id: generateId(),
            content: isAuthenticated
              ? "Please select one of your repositories:"
              : "You need to be logged in to access your repositories. Please enter a public repository instead:",
            sender: "ai",
            timestamp: new Date(),
            status: "sent",
          }
          if (!isAuthenticated) setSelectedRepoType("public")
          return [...messages, repoTypeResponse]
        } else {
          const errorResponse: Message = {
            id: generateId(),
            content: 'Please select either "Public Repository" or "Your Repository".',
            sender: "ai",
            timestamp: new Date(),
            status: "sent",
          }
          return [...messages, errorResponse]
        }

      case "repo_selection":
        if (selectedRepoType === "public") {
          const repoRegex = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/
          if (repoRegex.test(input)) {
            setSelectedRepository(input)
            setConversationStage("branch_selection")
            const branchResponse: Message = {
              id: generateId(),
              content: "Please enter the branch name:",
              sender: "ai",
              timestamp: new Date(),
              status: "sent",
            }
            return [...messages, branchResponse]
          } else {
            setRepoInputError('Invalid repository format. Please use "username/repo_name".')
            const errorResponse: Message = {
              id: generateId(),
              content: 'Invalid repository format. Please use "username/repo_name".',
              sender: "ai",
              timestamp: new Date(),
              status: "sent",
            }
            return [...messages, errorResponse]
          }
        } else if (selectedRepoType === "user") {
          const selectedRepo = repositories.find((repo) => repo.full_name === input)
          if (selectedRepo) {
            setSelectedRepository(selectedRepo.full_name)
            setSelectedBranch(selectedRepo.default_branch)
            setConversationStage("free_chat")
            setSuggestedQuestions([])
            const setupCompleteResponse: Message = {
              id: generateId(),
              content: `Repository setup complete! You're now connected to ${selectedRepo.full_name} on branch "${selectedRepo.default_branch}". How can I help you with this repository?`,
              sender: "ai",
              timestamp: new Date(),
              status: "sent",
            }
            setSuggestedQuestions([
              { id: "q1", text: "Show me recent commits" },
              { id: "q2", text: "List open pull requests" },
              { id: "q3", text: "Explain the project structure" },
            ])
            return [...messages, setupCompleteResponse]
          } else {
            const errorResponse: Message = {
              id: generateId(),
              content: "Please select a valid repository from the list.",
              sender: "ai",
              timestamp: new Date(),
              status: "sent",
            }
            return [...messages, errorResponse]
          }
        }
        break

      case "branch_selection":
        if (input.trim()) {
          setSelectedBranch(input)
          setConversationStage("free_chat")
          const setupCompleteResponse: Message = {
            id: generateId(),
            content: `Repository setup complete! You're now connected to ${selectedRepository} on branch "${input}". How can I help you with this repository?`,
            sender: "ai",
            timestamp: new Date(),
            status: "sent",
          }
          setSuggestedQuestions([
            { id: "q1", text: "Show me recent commits" },
            { id: "q2", text: "List open pull requests" },
            { id: "q3", text: "Explain the project structure" },
          ])
          return [...messages, setupCompleteResponse]
        } else {
          const errorResponse: Message = {
            id: generateId(),
            content: "Please enter a valid branch name.",
            sender: "ai",
            timestamp: new Date(),
            status: "sent",
          }
          return [...messages, errorResponse]
        }

      case "free_chat":
        setIsLoading(true)
        try {
          const response = await queryRepository(selectedRepository, selectedBranch, "user", input)
          const aiResponse: Message = {
            id: generateId(),
            content: response.content || "I couldn't find specific information about that in the repository.",
            sender: "ai",
            timestamp: new Date(),
            status: "sent",
            reactions: { thumbsUp: false, thumbsDown: false },
          }
          setIsLoading(false)
          return [...messages, aiResponse]
        } catch (error) {
          console.error("Error querying repository:", error)
          const errorResponse: Message = {
            id: generateId(),
            content: "I'm sorry, I encountered an error while analyzing the repository. Please try again later.",
            sender: "ai",
            timestamp: new Date(),
            status: "error",
            reactions: { thumbsUp: false, thumbsDown: false },
          }
          setIsLoading(false)
          return [...messages, errorResponse]
        }

      default:
        break
    }
    return messages
  }

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return
    const userMessage: Message = {
      id: generateId(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
      status: "sent",
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    const updatedMessages = await processUserInput(userMessage.content as string)
    setMessages(updatedMessages)
    setCurrentConversation((prev) => ({
      ...prev,
      lastMessage: userMessage.content as string,
      timestamp: new Date(),
    }))
  }

  // Handle suggested question click
  const handleSuggestedQuestionClick = (question: string) => {
    setInputValue(question)
    handleSendMessage()
  }

  // Search focus and change handlers
  const handleSearchFocus = () => setIsSearchFocused(true)
  const handleSearchBlur = () => setIsSearchFocused(false)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)

  // Toggle sidebar visibility
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  // New chat: reset conversation and state
  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: generateId(),
      title: "New Chat",
      lastMessage: "",
      timestamp: new Date(),
      unread: false,
      messages: [],
    }
    setConversations((prev) => [newConversation, ...prev])
    setActiveConversationId(newConversation.id)
    setCurrentConversation(newConversation)
    setMessages([])
    setInputValue("")
    setConversationStage("initial")
    if (isAuthenticated) {
      const initialMessage: Message = {
        id: generateId(),
        content: `Welcome back, ${user?.username}! Please choose the repository type:`,
        sender: "ai",
        timestamp: new Date(),
        status: "sent",
      }
      setMessages([initialMessage])
      setSuggestedQuestions([
        { id: "1", text: "Public Repository" },
        { id: "2", text: "Your Repository" },
      ])
      setConversationStage("repo_type")
    } else {
      const initialMessage: Message = {
        id: generateId(),
        content: "Please choose how you want to connect:",
        sender: "ai",
        timestamp: new Date(),
        status: "sent",
      }
      setMessages([initialMessage])
      setSuggestedQuestions([
        { id: "1", text: "Login with GitHub" },
        { id: "2", text: "Continue as Guest" },
      ])
    }
  }

  // Handle conversation selection from Sidebar
  const handleConversationClick = (conv: Conversation) => {
    setActiveConversationId(conv.id)
    setCurrentConversation(conv)
    setMessages(conv.messages)
  }

  // Copy message content to clipboard
  const handleCopyMessage = (content: string | React.ReactNode) => {
    if (typeof content === "string") navigator.clipboard.writeText(content)
  }

  // Toggle reaction (thumbs up/down)
  const handleReaction = (messageId: string, reactionType: "thumbsUp" | "thumbsDown") => {
    setMessages((prev) =>
      prev.map((message) => {
        if (message.id === messageId) {
          return {
            ...message,
            reactions: {
              ...message.reactions,
              [reactionType]: !message.reactions?.[reactionType],
            },
          }
        }
        return message
      }),
    )
  }

  // Regenerate the last AI response by reprocessing the last user message
  const handleRegenerateResponse = async () => {
    if (conversationStage !== "free_chat") return
    const lastUserMessageIndex = [...messages].reverse().findIndex((m) => m.sender === "user")
    if (lastUserMessageIndex !== -1) {
      const lastUserMessage = [...messages].reverse()[lastUserMessageIndex]
      const updatedMessages = messages.slice(0, messages.length - lastUserMessageIndex)
      setMessages(updatedMessages)
      setIsLoading(true)
      const regeneratedMessages = await processUserInput(lastUserMessage.content as string)
      setMessages(regeneratedMessages)
    }
  }

  // Export conversation as PDF using jsPDF
  const handleExportConversation = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text(currentConversation.title, 20, 20)
    doc.setFontSize(12)
    let y = 30
    messages.forEach((message) => {
      const sender = message.sender === "user" ? "You" : "AI Assistant"
      const content = typeof message.content === "string" ? message.content : "Complex content"
      const time = message.timestamp.toLocaleTimeString()
      doc.setFont("helvetica", "bold")
      doc.text(`${sender} (${time})`, 20, y)
      y += 10
      doc.setFont("helvetica", "normal")
      const textLines = doc.splitTextToSize(content, 170)
      doc.text(textLines, 20, y)
      y += 10 * textLines.length
      y += 10
      if (y > 280) {
        doc.addPage()
        y = 20
      }
    })
    doc.save(`${currentConversation.title.replace(/\s+/g, "_")}.pdf`)
  }

  // Clear current conversation and reset state
  const handleClearConversation = () => {
    setMessages([])
    setConversationStage("initial")
    if (isAuthenticated) {
      const initialMessage: Message = {
        id: generateId(),
        content: `Welcome back, ${user?.username}! Please choose the repository type:`,
        sender: "ai",
        timestamp: new Date(),
        status: "sent",
      }
      setMessages([initialMessage])
      setSuggestedQuestions([
        { id: "1", text: "Public Repository" },
        { id: "2", text: "Your Repository" },
      ])
      setConversationStage("repo_type")
    } else {
      const initialMessage: Message = {
        id: generateId(),
        content: "Please choose how you want to connect:",
        sender: "ai",
        timestamp: new Date(),
        status: "sent",
      }
      setMessages([initialMessage])
      setSuggestedQuestions([
        { id: "1", text: "Login with GitHub" },
        { id: "2", text: "Continue as Guest" },
      ])
    }
    setCurrentConversation((prev) => ({
      ...prev,
      lastMessage: "",
      timestamp: new Date(),
    }))
  }

  // Logout and clear conversation
  const handleLogout = () => {
    logout()
    handleClearConversation()
  }

  // Render message content (preserving any complex React nodes)
  const renderMessageContent = (content: string | React.ReactNode) => {
    return typeof content === "string" ? content : content
  }

  return (
    <div
      className={`min-h-screen flex flex-col overflow-hidden transition-colors duration-300 ${darkMode ? "dark bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}
    >
      <Sidebar
        darkMode={darkMode}
        isAuthenticated={isAuthenticated}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearchFocused={isSearchFocused}
        handleSearchFocus={handleSearchFocus}
        handleSearchBlur={handleSearchBlur}
        searchInputRef={searchInputRef}
        handleNewChat={handleNewChat}
        groupedConversations={groupedConversations}
        activeConversationId={activeConversationId}
        handleConversationClick={handleConversationClick}
        user={user}
      />
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          sidebarOpen ? "md:ml-80" : "md:ml-0"
        }`}
      >
        <Header
          darkMode={darkMode}
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          currentConversation={currentConversation}
          isAuthenticated={isAuthenticated}
          repoDropdownOpen={repoDropdownOpen}
          setRepoDropdownOpen={setRepoDropdownOpen}
          repositories={repositories}
          selectedRepository={selectedRepository}
          setSelectedRepository={setSelectedRepository}
          setSelectedBranch={setSelectedBranch}
          handleNewChat={handleNewChat}
          handleLogout={handleLogout}
          user={user}
          toggleDarkMode={toggleDarkMode}
        />

        <main className="flex-1 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-black/10 dark:bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-700 dark:text-gray-300 font-medium">Processing your request...</p>
              </div>
            </div>
          )}

          <ChatMessages
            messages={messages}
            darkMode={darkMode}
            renderMessageContent={renderMessageContent}
            handleCopyMessage={handleCopyMessage}
            handleReaction={handleReaction}
            conversationStage={conversationStage}
          />
        </main>

        <ChatInput
          conversationStage={conversationStage}
          selectedRepoType={selectedRepoType}
          handleRegenerateResponse={handleRegenerateResponse}
          handleExportConversation={handleExportConversation}
          handleClearConversation={handleClearConversation}
          suggestedQuestions={suggestedQuestions}
          handleSuggestedQuestionClick={handleSuggestedQuestionClick}
          inputValue={inputValue}
          handleInputChange={handleInputChange}
          handleKeyDown={handleKeyDown}
          handleSendMessage={handleSendMessage}
          tokenCount={tokenCount}
          repoInputError={repoInputError}
          textareaRef={textareaRef}
        />
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

export default App

