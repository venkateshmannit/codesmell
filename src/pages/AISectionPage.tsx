import type React from "react"
import { Zap, Cpu, Sparkles, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Header from "../components/Header"

const AISectionPage: React.FC = () => {
  const navigate = useNavigate()

  const handleWrenClick = () => {
    console.log("Wren AI button clicked")
    navigate("/repo Connection")
  }

  const handleTinaClick = () => {
    console.log("Tina button clicked")
    navigate("/gitauth")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Full-width fixed header */}
      <div className="w-full fixed top-0 left-0 z-50">
        <Header />
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-300/20 dark:bg-purple-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-teal-300/20 dark:bg-teal-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 right-1/4 w-64 h-64 bg-purple-300/20 dark:bg-purple-300/30 rounded-full blur-3xl"></div>
      </div>

      {/* Content below the header */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 mt-16">
        <div className="max-w-4xl w-full mx-auto text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-800/30 text-purple-700 dark:text-purple-200 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            <span>AI-Powered Solutions</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
            Choose Your AI Assistant
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Select the AI assistant that best fits your needs. Each offers unique capabilities to enhance your workflow.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Wren AI Card */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl flex flex-col h-full">
                <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                  <Zap className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pandu</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">
                Advanced AI for data processing and intelligent dashboard insights.
                </p>
                <button
                  onClick={handleWrenClick}
                  className="flex items-center justify-center w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>

            {/* Tina Card */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-600 to-green-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl flex flex-col h-full">
                <div className="w-14 h-14 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-4">
                  <Cpu className="w-7 h-7 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tina</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">
                 
                  Powerful AI assistant for repository connections and code analysis.
                </p>
                <button
                  onClick={handleTinaClick}
                  className="flex items-center justify-center w-full bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help choosing?{" "}
              <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline">
                View comparison
              </a>{" "}
              or{" "}
              <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline">
                contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AISectionPage
