import type React from "react"
import type { Node } from "reactflow"
import { ChevronLeft, Edit, Plus, Database, Key } from "lucide-react"

interface SlidingSidePanelProps {
  selectedNode: Node
  onClose: () => void
}

const SlidingSidePanel: React.FC<SlidingSidePanelProps> = ({ selectedNode, onClose }) => {
  return (
    <div
      className="fixed left-0 top-0 bottom-0 z-10 transition-transform duration-300 mt-16 h-[calc(100vh-4rem)]"
      style={{ transform: "translateX(0)" }}
    >
      <div className="w-[750px] h-full bg-white dark:bg-slate-900 rounded-r-lg shadow-xl overflow-hidden border-r border-t border-b border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center">
              <Database className="w-4 h-4 mr-2 text-indigo-500" />
              <span className="text-slate-700 dark:text-slate-200 font-medium">{selectedNode.data.title}</span>
            </div>
          </div>
          <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">
            <Edit className="h-3.5 w-3.5" />
            <span>Edit</span>
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Name</div>
              <div className="text-sm text-slate-800 dark:text-slate-200 font-medium">{selectedNode.data.title}</div>
            </div>

            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Alias</div>
              <div className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                {selectedNode.data.alias || selectedNode.data.title}
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Description</div>
            <div className="text-sm text-slate-700 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
              {selectedNode.data.description || "No description provided for this table."}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Columns ({selectedNode.data.columns.length})
              </div>
              <button className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors">
                <Plus className="h-3.5 w-3.5" />
                <span>Add column</span>
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-8"></th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Alias
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                  {selectedNode.data.columns.map((col: any, index: number) => (
                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                        {col.name}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                        {col.alias || col.name}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                        <div className="flex items-center">
                          <span className={`text-xs mr-1 ${col.required ? "text-rose-500" : "text-slate-400"}`}>
                            {col.required ? "+" : "-"}
                          </span>
                          <span>{col.type || "VARCHAR"}</span>
                          {col.key && <Key className="ml-1.5 text-amber-500 w-3 h-3" />}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {col.description || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Relationships ({selectedNode.data.relations.length})
              </div>
              <button className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors">
                <Plus className="h-3.5 w-3.5" />
                <span>Add relationship</span>
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-8"></th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      From
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      To
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                  {selectedNode.data.relations.map((rel: any, index: number) => (
                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                        {rel.name || "-"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                        {rel.from || "-"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                        {rel.to || "-"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                        {rel.type || "-"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {rel.description || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Data preview (100 rows)</div>
            <button className="px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">
              Preview data
            </button>
            <div className="mt-8 flex flex-col items-center justify-center h-32 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                  <path d="M14 17H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">No Data</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SlidingSidePanel

