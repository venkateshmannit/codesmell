import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  RefreshCw, 
  Download, 
  Trash2, 
  Moon, 
  Sun, 
  Plus, 
  LogOut,
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  GitBranch
} from 'lucide-react';
import jsPDF from 'jspdf';

// Types
type MessageSender = 'user' | 'ai';
type MessageStatus = 'sending' | 'sent' | 'error';
type ConversationStage = 'initial' | 'repo_type' | 'repo_selection' | 'branch_selection' | 'free_chat';

interface Reactions {
  thumbsUp?: boolean;
  thumbsDown?: boolean;
}

interface Message {
  id: string;
  content: string | React.ReactNode;
  sender: MessageSender;
  timestamp: Date;
  status: MessageStatus;
  reactions?: Reactions;
}

interface SuggestedQuestion {
  id: string;
  text: string;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  unread: boolean;
  messages: Message[];
}

const Chatpage: React.FC = () => {
  // State for dark mode
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  // State for sidebar
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  
  // State for repository dropdown
  const [repoDropdownOpen, setRepoDropdownOpen] = useState<boolean>(false);
  
  // State for search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  
  // State for conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  
  // State for current conversation
  const [currentConversation, setCurrentConversation] = useState<Conversation>({
    id: '1',
    title: 'New Chat',
    lastMessage: '',
    timestamp: new Date(),
    unread: false,
    messages: []
  });
  
  // State for messages
  const [messages, setMessages] = useState<Message[]>([]);
  
  // State for input
  const [inputValue, setInputValue] = useState<string>('');
  const [tokenCount, setTokenCount] = useState<number>(0);
  
  // State for loading
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // State for suggested questions
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  
  // State for conversation stage
  const [conversationStage, setConversationStage] = useState<ConversationStage>('initial');
  
  // State for repository data
  const [selectedRepoType, setSelectedRepoType] = useState<string>('');
  const [repositories, setRepositories] = useState<string[]>(["repo1", "repo2", "repo3"]);
  const [selectedRepository, setSelectedRepository] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [repoInputError, setRepoInputError] = useState<string>('');
  
  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize conversation
  useEffect(() => {
    // Start with the initial AI message
    const initialMessage: Message = {
      id: '1',
      content: 'Please choose the repository type:',
      sender: 'ai',
      timestamp: new Date(),
      status: 'sent',
    };
    
    setMessages([initialMessage]);
    
    // Add repository type options as suggested questions
    setSuggestedQuestions([
      { id: '1', text: 'Public Repository' },
      { id: '2', text: 'Your Repository' }
    ]);
    
    setConversationStage('repo_type');
  }, []);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 250)}px`;
    }
  }, [inputValue]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Update token count
  useEffect(() => {
    setTokenCount(inputValue.length);
  }, [inputValue]);
  
  // Group conversations by date
  const groupedConversations = conversations.reduce<Record<string, Conversation[]>>((groups, conv) => {
    const date = conv.timestamp.toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(conv);
    return groups;
  }, {});
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Clear error when user starts typing again
    if (repoInputError) {
      setRepoInputError('');
    }
  };
  
  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Generate a unique ID
  const generateId = () => {
    return Math.random().toString(36).substring(2, 11);
  };
  
  // Process user input based on conversation stage
  const processUserInput = (input: string) => {
    switch (conversationStage) {
      case 'repo_type':
        if (input.toLowerCase() === 'public repository' || input === '1') {
          setSelectedRepoType('public');
          setConversationStage('repo_selection');
          
          // Clear suggested questions
          setSuggestedQuestions([]);
          
          // Add AI response
          const repoTypeResponse: Message = {
            id: generateId(),
            content: 'Please enter the repository path in format "username/repo_name":',
            sender: 'ai',
            timestamp: new Date(),
            status: 'sent',
          };
          
          return [...messages, repoTypeResponse];
        } else if (input.toLowerCase() === 'your repository' || input === '2') {
          setSelectedRepoType('user');
          setConversationStage('repo_selection');
          
          // Set repository options as suggested questions
          setSuggestedQuestions(
            repositories.map((repo, index) => ({
              id: `repo-${index}`,
              text: repo
            }))
          );
          
          // Add AI response
          const repoTypeResponse: Message = {
            id: generateId(),
            content: 'Please select one of your repositories:',
            sender: 'ai',
            timestamp: new Date(),
            status: 'sent',
          };
          
          return [...messages, repoTypeResponse];
        } else {
          // Invalid input
          const errorResponse: Message = {
            id: generateId(),
            content: 'Please select either "Public Repository" or "Your Repository".',
            sender: 'ai',
            timestamp: new Date(),
            status: 'sent',
          };
          
          return [...messages, errorResponse];
        }
      
      case 'repo_selection':
        if (selectedRepoType === 'public') {
          // Validate repository format (username/repo_name)
          const repoRegex = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/;
          
          if (repoRegex.test(input)) {
            setSelectedRepository(input);
            setConversationStage('branch_selection');
            
            // Add AI response
            const branchResponse: Message = {
              id: generateId(),
              content: 'Please enter the branch name:',
              sender: 'ai',
              timestamp: new Date(),
              status: 'sent',
            };
            
            return [...messages, branchResponse];
          } else {
            setRepoInputError('Invalid repository format. Please use "username/repo_name".');
            
            // Add AI response
            const errorResponse: Message = {
              id: generateId(),
              content: 'Invalid repository format. Please use "username/repo_name".',
              sender: 'ai',
              timestamp: new Date(),
              status: 'sent',
            };
            
            return [...messages, errorResponse];
          }
        } else if (selectedRepoType === 'user') {
          if (repositories.includes(input)) {
            setSelectedRepository(input);
            setConversationStage('branch_selection');
            
            // Clear suggested questions
            setSuggestedQuestions([]);
            
            // Add AI response
            const branchResponse: Message = {
              id: generateId(),
              content: 'Please enter the branch name:',
              sender: 'ai',
              timestamp: new Date(),
              status: 'sent',
            };
            
            return [...messages, branchResponse];
          } else {
            // Invalid repository selection
            const errorResponse: Message = {
              id: generateId(),
              content: 'Please select a valid repository from the list.',
              sender: 'ai',
              timestamp: new Date(),
              status: 'sent',
            };
            
            return [...messages, errorResponse];
          }
        }
        break;
      
      case 'branch_selection':
        // Simple validation for branch name (non-empty)
        if (input.trim()) {
          setSelectedBranch(input);
          setConversationStage('free_chat');
          
          // Add AI response
          const setupCompleteResponse: Message = {
            id: generateId(),
            content: `Repository setup complete! You're now connected to ${selectedRepository} on branch "${input}". How can I help you with this repository?`,
            sender: 'ai',
            timestamp: new Date(),
            status: 'sent',
          };
          
          // Set suggested questions for the repository context
          setSuggestedQuestions([
            { id: 'q1', text: 'Show me recent commits' },
            { id: 'q2', text: 'List open pull requests' },
            { id: 'q3', text: 'Explain the project structure' }
          ]);
          
          return [...messages, setupCompleteResponse];
        } else {
          // Invalid branch name
          const errorResponse: Message = {
            id: generateId(),
            content: 'Please enter a valid branch name.',
            sender: 'ai',
            timestamp: new Date(),
            status: 'sent',
          };
          
          return [...messages, errorResponse];
        }
      
      case 'free_chat':
        // In free chat mode, simulate AI response
        setTimeout(() => {
          const aiResponse: Message = {
            id: generateId(),
            content: `I'm analyzing your request about "${input}" in the context of ${selectedRepository} (${selectedBranch} branch). This is a simulated response.`,
            sender: 'ai',
            timestamp: new Date(),
            status: 'sent',
            reactions: { thumbsUp: false, thumbsDown: false }
          };
          
          setMessages(prevMessages => [...prevMessages, aiResponse]);
          setIsLoading(false);
        }, 1500);
        
        break;
      
      default:
        break;
    }
    
    return messages;
  };
  
  // Handle send message
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Create user message
    const userMessage: Message = {
      id: generateId(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent',
    };
    
    // Add user message to messages
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Clear input
    setInputValue('');
    
    // Process user input based on conversation stage
    if (conversationStage !== 'free_chat') {
      const updatedMessages = processUserInput(userMessage.content as string);
      setTimeout(() => {
        setMessages(updatedMessages);
      }, 500);
    } else {
      // In free chat mode, show loading
      setIsLoading(true);
      processUserInput(userMessage.content as string);
    }
    
    // Update conversation
    setCurrentConversation(prev => ({
      ...prev,
      lastMessage: userMessage.content as string,
      timestamp: new Date()
    }));
  };
  
  // Handle suggested question click
  const handleSuggestedQuestionClick = (question: string) => {
    setInputValue(question);
    handleSendMessage();
  };
  
  // Handle search focus
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };
  
  // Handle search blur
  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };
  
  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Handle new chat
  const handleNewChat = () => {
    // Create new conversation
    const newConversation: Conversation = {
      id: generateId(),
      title: 'New Chat',
      lastMessage: '',
      timestamp: new Date(),
      unread: false,
      messages: []
    };
    
    // Add new conversation to conversations
    setConversations(prev => [newConversation, ...prev]);
    
    // Set active conversation
    setActiveConversationId(newConversation.id);
    
    // Set current conversation
    setCurrentConversation(newConversation);
    
    // Reset messages
    setMessages([]);
    
    // Reset input
    setInputValue('');
    
    // Reset conversation stage
    setConversationStage('initial');
    
    // Add initial AI message
    const initialMessage: Message = {
      id: generateId(),
      content: 'Please choose the repository type:',
      sender: 'ai',
      timestamp: new Date(),
      status: 'sent',
    };
    
    setMessages([initialMessage]);
    
    // Add repository type options as suggested questions
    setSuggestedQuestions([
      { id: '1', text: 'Public Repository' },
      { id: '2', text: 'Your Repository' }
    ]);
    
    setConversationStage('repo_type');
  };
  
  // Handle conversation click
  const handleConversationClick = (conversation: Conversation) => {
    setActiveConversationId(conversation.id);
    setCurrentConversation(conversation);
    setMessages(conversation.messages);
  };
  
  // Handle copy message
  const handleCopyMessage = (content: string | React.ReactNode) => {
    if (typeof content === 'string') {
      navigator.clipboard.writeText(content);
    }
  };
  
  // Handle reaction
  const handleReaction = (messageId: string, reactionType: 'thumbsUp' | 'thumbsDown') => {
    setMessages(prevMessages =>
      prevMessages.map(message => {
        if (message.id === messageId) {
          return {
            ...message,
            reactions: {
              ...message.reactions,
              [reactionType]: !message.reactions?.[reactionType]
            }
          };
        }
        return message;
      })
    );
  };
  
  // Handle regenerate response
  const handleRegenerateResponse = () => {
    if (conversationStage !== 'free_chat') return;
    
    // Find last user message
    const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.sender === 'user');
    
    if (lastUserMessageIndex !== -1) {
      const lastUserMessage = [...messages].reverse()[lastUserMessageIndex];
      
      // Remove all messages after last user message
      const updatedMessages = messages.slice(0, messages.length - lastUserMessageIndex);
      
      setMessages(updatedMessages);
      
      // Show loading
      setIsLoading(true);
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: generateId(),
          content: `This is a regenerated response for "${lastUserMessage.content}". (Simulated)`,
          sender: 'ai',
          timestamp: new Date(),
          status: 'sent',
          reactions: { thumbsUp: false, thumbsDown: false }
        };
        
        setMessages(prev => [...prev, aiResponse]);
        setIsLoading(false);
      }, 1500);
    }
  };
  
  // Handle export conversation
  const handleExportConversation = () => {
    const doc = new jsPDF();
    
    // Set title
    doc.setFontSize(16);
    doc.text(currentConversation.title, 20, 20);
    
    // Set content
    doc.setFontSize(12);
    let y = 30;
    
    messages.forEach(message => {
      const sender = message.sender === 'user' ? 'You' : 'AI Assistant';
      const content = typeof message.content === 'string' ? message.content : 'Complex content';
      const time = message.timestamp.toLocaleTimeString();
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${sender} (${time})`, 20, y);
      y += 10;
      
      doc.setFont('helvetica', 'normal');
      
      // Split long text into multiple lines
      const textLines = doc.splitTextToSize(content, 170);
      doc.text(textLines, 20, y);
      y += 10 * textLines.length;
      
      // Add spacing between messages
      y += 10;
      
      // Check if we need a new page
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });
    
    // Save PDF
    doc.save(`${currentConversation.title.replace(/\s+/g, '_')}.pdf`);
  };
  
  // Handle clear conversation
  const handleClearConversation = () => {
    // Reset messages
    setMessages([]);
    
    // Reset conversation stage
    setConversationStage('initial');
    
    // Add initial AI message
    const initialMessage: Message = {
      id: generateId(),
      content: 'Please choose the repository type:',
      sender: 'ai',
      timestamp: new Date(),
      status: 'sent',
    };
    
    setMessages([initialMessage]);
    
    // Add repository type options as suggested questions
    setSuggestedQuestions([
      { id: '1', text: 'Public Repository' },
      { id: '2', text: 'Your Repository' }
    ]);
    
    setConversationStage('repo_type');
    
    // Update conversation
    setCurrentConversation(prev => ({
      ...prev,
      lastMessage: '',
      timestamp: new Date()
    }));
  };
  
  // Handle logout
  const handleLogout = () => {
    // Simulate logout
    alert('Logout functionality would be implemented here.');
  };
  
  // Render message content
  const renderMessageContent = (content: string | React.ReactNode) => {
    if (typeof content === 'string') {
      return content;
    }
    return content;
  };
  
  return (
    <div
      className={`min-h-screen flex transition-colors duration-200 ${
        darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      {/* Fixed Sidebar with Increased Width */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-10 w-80 border-r border-gray-200 dark:border-gray-700 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } transition-transform duration-300 ease-in-out flex flex-col`}
      >
        {/* Search bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div
            className={`relative rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 ${
              isSearchFocused ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              placeholder="Search conversations"
              className={`block w-full pl-10 pr-3 py-2 border-none rounded-lg focus:outline-none text-sm ${
                darkMode ? 'bg-gray-800 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-400'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" />
              </button>
            )}
          </div>
        </div>

        {/* New chat button */}
        <button
          onClick={handleNewChat}
          className="mx-4 mt-4 mb-2 flex items-center justify-center space-x-2 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium">New Chat</span>
        </button>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {Object.keys(groupedConversations).length > 0 ? (
            Object.entries(groupedConversations).map(([dateKey, convs]) => (
              <div key={dateKey} className="mt-4">
                <h3 className="px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider opacity-70">
                  {dateKey}
                </h3>
                <div className="mt-1 space-y-1">
                  {convs.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleConversationClick(conv)}
                      className={`w-full text-left px-4 py-3 flex flex-col hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        activeConversationId === conv.id ? 'bg-gray-200 dark:bg-gray-600' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span
                          className={`font-bold truncate ${
                            conv.unread 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : darkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {conv.title}
                          {conv.unread && (
                            <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </span>
                        <span className="text-xs font-light text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2 opacity-60">
                          {conv.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm font-normal text-gray-600 dark:text-gray-300 truncate mt-1 opacity-80">
                        {conv.lastMessage}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : searchQuery ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 opacity-80">
              <p className="font-medium">No conversations found</p>
              <p className="text-sm mt-1 font-normal">Try a different search term</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 opacity-80">
              <p className="font-medium">No conversations yet</p>
              <p className="text-sm mt-1 font-normal">Start a new chat to begin</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area with Dynamic Width */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'md:ml-80' : 'md:ml-0'}`}>
        {/* Fixed Header with Sidebar Toggle */}
        <header className={`fixed top-0 left-0 right-0 z-20 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        } ${sidebarOpen ? 'md:left-80' : 'md:left-0'}`}>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-2"
              aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            >
              {sidebarOpen ? <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
            </button>
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{currentConversation.title}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="h-5 w-5 text-gray-400" /> : <Moon className="h-5 w-5 text-gray-600" />}
            </button>
           
            <button
              onClick={handleNewChat}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="New chat"
            >
              <Plus className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </header>

        {/* Scrollable Messages Area */}
        <div className="flex-1 overflow-y-auto pt-20 pb-40 px-4">
          {isLoading && (
            <div className="flex justify-center my-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                  } ${message.status === 'sending' ? 'opacity-70' : 'opacity-100'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium">
                      {message.sender === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="prose dark:prose-invert">{renderMessageContent(message.content)}</div>
                  {message.status === 'sending' && (
                    <div className="mt-2 text-sm opacity-70">Sending...</div>
                  )}
                  {message.sender === 'ai' && message.status === 'sent' && conversationStage === 'free_chat' && (
                    <div className="mt-3 flex items-center space-x-2">
                      <button
                        onClick={() => handleCopyMessage(message.content)}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        aria-label="Copy message"
                      >
                        <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => message.reactions && handleReaction(message.id, 'thumbsUp')}
                        className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                          message.reactions?.thumbsUp ? 'text-green-500' : ''
                        }`}
                        aria-label="Thumbs up"
                      >
                        <ThumbsUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => message.reactions && handleReaction(message.id, 'thumbsDown')}
                        className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                          message.reactions?.thumbsDown ? 'text-red-500' : ''
                        }`}
                        aria-label="Thumbs down"
                      >
                        <ThumbsDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Fixed Bottom Section */}
        <div className={`fixed bottom-0 left-0 right-0 z-10 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-4 border-t border-gray-200 dark:border-gray-700 ${sidebarOpen ? 'md:left-80' : 'md:left-0'}`}>
          {/* Action Buttons - Only show in free chat mode */}
          {conversationStage === 'free_chat' && (
            <div className="flex justify-center mb-4 space-x-2 flex-wrap">
              <button
                onClick={handleRegenerateResponse}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors m-1"
                aria-label="Regenerate response"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Regenerate</span>
              </button>
              <button
                onClick={handleExportConversation}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors m-1"
                aria-label="Export conversation"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button
                onClick={handleClearConversation}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors m-1"
                aria-label="Clear conversation"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear</span>
              </button>
            </div>
          )}

          {/* Suggested Questions */}
          {suggestedQuestions.length > 0 && (
            <div className="mb-4 flex justify-center gap-2 flex-wrap">
              {suggestedQuestions.map((question) => (
                <button
                  key={question.id}
                  onClick={() => handleSuggestedQuestionClick(question.text)}
                  className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors"
                >
                  {question.text}
                </button>
              ))}
            </div>
          )}

          {/* Chat Text Input */}
          <div className="relative border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800">
            {repoInputError && (
              <div className="absolute -top-8 left-0 right-0 bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm">
                {repoInputError}
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={
                conversationStage === 'repo_type' 
                  ? "Type '1' for Public Repository or '2' for Your Repository..." 
                  : conversationStage === 'repo_selection' && selectedRepoType === 'public'
                    ? "Enter repository in format 'username/repo_name'..."
                    : conversationStage === 'repo_selection' && selectedRepoType === 'user'
                      ? "Enter repository name..."
                      : conversationStage === 'branch_selection'
                        ? "Enter branch name..."
                        : "Message ChatGPT..."
              }
              className={`w-full p-4 pr-16 resize-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-gray-800 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-400'
              }`}
              rows={1}
              style={{ minHeight: '75px', maxHeight: '250px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className={`absolute right-3 bottom-6 p-2 rounded-full ${
                inputValue.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              } transition-colors`}
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
            <div className="absolute left-3 bottom-3 text-xs text-gray-500 dark:text-gray-400">
              {tokenCount} characters
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatpage;