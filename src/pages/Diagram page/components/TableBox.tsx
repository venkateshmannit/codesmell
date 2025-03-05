import type React from "react"
import { Handle, Position } from "reactflow"
import { ChevronDown, Database, Key } from "lucide-react"

export interface TableBoxProps {
  title: string
  columns: { name: string; required: boolean; key?: boolean }[]
  sections: { title: string; count: number }[]
  relations: { type: string }[]
}

export const TableBox: React.FC<TableBoxProps> = ({ title, columns, sections, relations }) => {
  return (
    <div
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm w-64 overflow-hidden"
      style={{ margin: "10px" }}
    >
      <div className="flex items-center justify-between p-3 bg-indigo-600 dark:bg-indigo-700 text-white rounded-t-lg">
        <div className="flex items-center">
          <Database className="w-4 h-4 mr-2 opacity-80" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <button className="text-white opacity-80 hover:opacity-100 transition-opacity">
          <ChevronDown size={14} />
        </button>
      </div>

      <div className="p-3 border-b border-slate-200 dark:border-slate-700">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Columns</div>
        <div className="space-y-1">
          {columns.map((column, index) => (
            <div key={index} className="flex items-center text-xs py-0.5 group">
              <span className={`w-4 ${column.required ? "text-rose-500" : "text-slate-400"} mr-1`}>
                {column.required ? "++" : "--"}
              </span>
              <span className="truncate text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {column.name}
              </span>
              {column.key && <Key className="ml-auto text-amber-500 w-3 h-3" />}
            </div>
          ))}
        </div>
      </div>

      {sections.map((section, index) => (
        <div key={index} className="p-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400">{section.title}</span>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-full">
              {section.count}
            </span>
          </div>
        </div>
      ))}

      <div className="p-3">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Relations</div>
        <div className="space-y-1">
          {relations.map((relation, index) => (
            <div key={index} className="flex items-center text-xs py-0.5 group">
              <svg
                className="w-4 h-4 mr-1 text-slate-400 group-hover:text-indigo-500 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                />
              </svg>
              <span className="text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {relation.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Define connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ background: "#6366f1", border: "2px solid white", width: "10px", height: "10px" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ background: "#6366f1", border: "2px solid white", width: "10px", height: "10px" }}
      />
    </div>
  )
}

export const TableBoxNode: React.FC<{ data: TableBoxProps }> = ({ data }) => {
  return <TableBox {...data} />
}

