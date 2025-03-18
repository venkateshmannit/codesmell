// src/pages/Pandu/modeling/components/TableBox.tsx
"use client";

import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import {
  ChevronDown,
  ChevronUp,
  Database,
  Key,
  Link,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

export interface TableBoxProps {
  title: string;
  columns?: {
    name: string;
    required: boolean;
    key?: boolean;
    foreignKey?: boolean;
    type?: string;
    alias?: string;
    description?: string;
  }[];
  sections?: { title: string; count: number }[];
  relations?: {
    name?: string;
    from?: string;
    to?: string;
    type?: string;
    description?: string;
  }[];
}

export const TableBox: React.FC<TableBoxProps> = ({
  title,
  columns = [],
  sections = [],
  relations = [],
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Count primary keys and foreign keys
  const primaryKeyCount = columns.filter((col) => col.key).length;
  const foreignKeyCount = columns.filter((col) => col.foreignKey).length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm w-64 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="flex items-center">
          <Database className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="flex items-center">
          <div className="flex items-center mr-2 text-xs bg-purple-800 px-1.5 py-0.5 rounded">
            <span>{columns.length}</span>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="transition-opacity hover:opacity-100"
          >
            {isCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Key counts */}
          <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 flex items-center justify-between text-xs">
            <div className="flex items-center">
              <Key className="w-3 h-3 mr-1 text-amber-500" />
              <span className="text-slate-700 dark:text-slate-300">
                Primary: <span className="font-medium">{primaryKeyCount}</span>
              </span>
            </div>
            <div className="flex items-center">
              <Link className="w-3 h-3 mr-1 text-indigo-500" />
              <span className="text-slate-700 dark:text-slate-300">
                Foreign: <span className="font-medium">{foreignKeyCount}</span>
              </span>
            </div>
          </div>

          {/* Columns */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-700">
            <h4 className="text-xs font-medium text-slate-500 mb-2">Columns</h4>
            {columns.length > 0 ? (
              <ul className="space-y-1">
                {columns.map((col, index) => (
                  <li key={index} className="flex items-center text-xs">
                    <span
                      className={`mr-1 ${
                        col.required ? "text-rose-500" : "text-slate-400"
                      }`}
                    >
                      {col.required ? "++" : "--"}
                    </span>
                    <span className="flex-1 text-slate-700 dark:text-slate-300 font-medium">
                      {col.name}
                    </span>
                    <span className="text-xs text-slate-500 mr-1">
                      {col.type?.split("_").pop()?.toLowerCase()}
                    </span>
                    {col.key && (
                      <Key className="text-amber-500 w-3 h-3 ml-1" />
                    )}
                    {col.foreignKey && (
                      <Link className="text-indigo-500 w-3 h-3 ml-1" />
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">No columns available.</p>
            )}
          </div>

          {/* Sections */}
          {sections.length > 0 && (
            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
              {sections.map((section, index) => (
                <div
                  key={index}
                  className="flex justify-between text-xs text-slate-600 dark:text-slate-400"
                >
                  <span>{section.title}</span>
                  <span className="bg-slate-100 dark:bg-slate-800 px-1.5 rounded-md">
                    {section.count}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Relations */}
          {relations.length > 0 && (
            <div className="p-3">
              <h4 className="text-xs font-medium text-slate-500 mb-2 flex items-center">
                <ExternalLink className="w-3 h-3 mr-1" /> Relations
              </h4>
              <ul className="space-y-1.5">
                {relations.map((relation, index) => (
                  <li
                    key={index}
                    className="flex items-center text-xs text-slate-700 dark:text-slate-300"
                  >
                    <ArrowRight className="w-3 h-3 mr-1 text-indigo-500" />
                    <span>
                      {relation.name ? `${relation.name}: ` : ""}
                      {relation.from} &rarr; {relation.to} ({relation.type})
                      {relation.description && ` - ${relation.description}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{
          background: "#6366f1",
          border: "2px solid white",
          width: 8,
          height: 8,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{
          background: "#6366f1",
          border: "2px solid white",
          width: 8,
          height: 8,
        }}
      />
    </div>
  );
};

export const TableBoxNode: React.FC<{ data: TableBoxProps }> = ({ data }) => {
  return <TableBox {...data} />;
};

export default TableBox;
