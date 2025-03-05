"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown, ChevronRight, RotateCw, Plus, Clock, Settings, HelpCircle, Info } from "lucide-react"

const Sidebar: React.FC = () => {
  const [expandedModels, setExpandedModels] = useState<Record<string, boolean>>({
    customers: false,
    "order items": false,
    orders: false,
    "order payments": false,
    products: false,
    "order reviews": false,
    geolocation: false,
    sellers: false,
    "product category translation": false,
  })

  const toggleModel = (model: string) => {
    setExpandedModels((prev) => ({
      ...prev,
      [model]: !prev[model],
    }))
  }

  return (
    <div className="w-64 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full bg-white dark:bg-slate-900 shadow-sm">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <div className="flex items-center">
          <h2 className="font-medium text-slate-800 dark:text-slate-200">Models</h2>
          <span className="text-slate-500 ml-1 text-xs">(9)</span>
        </div>
        <div className="flex items-center">
          <button className="mr-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
            <RotateCw size={16} />
          </button>
          <button className="flex items-center text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            <Plus size={14} className="mr-1" />
            <span>New</span>
          </button>
        </div>
      </div>
      <div className="overflow-auto flex-1 py-2">
        {Object.keys(expandedModels).map((model) => (
          <div key={model} className="mb-0.5">
            <div
              className={`flex items-center px-4 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                expandedModels[model] ? "bg-slate-50 dark:bg-slate-800" : ""
              }`}
              onClick={() => toggleModel(model)}
            >
              <span className="mr-1 text-slate-500">
                {expandedModels[model] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
              <span className="w-5 h-5 flex items-center justify-center mr-2 text-slate-600 dark:text-slate-400">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{model}</span>
            </div>
            {expandedModels[model] && (
              <div className="pl-12 pr-4 py-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                No fields configured
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Credit usage</span>
          </div>
          <button className="text-indigo-600 dark:text-indigo-400 text-xs font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
            Manage credits
          </button>
        </div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">95</span>
          <span className="text-xs text-slate-500">credits left (95%)</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
          <div className="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full" style={{ width: "95%" }}></div>
        </div>
      </div>
      <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-1">
        <button className="flex w-full items-center py-1.5 px-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
          <Settings className="w-4 h-4 mr-3" />
          <span>Settings</span>
        </button>
        <button className="flex w-full items-center py-1.5 px-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
          <HelpCircle className="w-4 h-4 mr-3" />
          <span>Get support</span>
        </button>
        <button className="flex w-full items-center py-1.5 px-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
          <Info className="w-4 h-4 mr-3" />
          <span>About this dataset</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar

