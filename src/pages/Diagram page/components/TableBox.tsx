import React from "react";
import { Handle, Position } from "reactflow";
import { ChevronDown } from "react-feather";

export interface TableBoxProps {
  title: string;
  columns: { name: string; required: boolean; key?: boolean }[];
  sections: { title: string; count: number }[];
  relations: { type: string }[];
}

export const TableBox: React.FC<TableBoxProps> = ({
  title,
  columns,
  sections,
  relations,
}) => {
  return (
    <div className="bg-white border rounded shadow-sm w-64 p-2 mb-4" style={{ margin: "10px" }}>
      <div className="flex items-center justify-between p-2 bg-blue-600 text-white rounded-t">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7"
            />
          </svg>
          <span className="text-xs">{title}</span>
        </div>
        <button className="text-white">
          <ChevronDown size={14} />
        </button>
      </div>

      <div className="p-2 border-b">
        <div className="text-xs font-medium mb-1">Columns</div>
        {columns.map((column, index) => (
          <div key={index} className="flex items-center text-xs py-0.5">
            <span className="w-4 text-red-500 mr-1">{column.required ? "++" : "--"}</span>
            <span className="truncate">{column.name}</span>
            {column.key && <span className="ml-auto text-gray-400 text-xs">🔑</span>}
          </div>
        ))}
      </div>

      {sections.map((section, index) => (
        <div key={index} className="p-2 border-b">
          <div className="flex items-center justify-between">
            <span className="text-xs">{section.title}</span>
            <span className="text-xs bg-gray-100 px-1 rounded">{section.count}</span>
          </div>
        </div>
      ))}

      <div className="p-2">
        {relations.map((relation, index) => (
          <div key={index} className="flex items-center text-xs py-0.5">
            <svg
              className="w-4 h-4 mr-1 text-gray-500"
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
            <span>{relation.type}</span>
          </div>
        ))}
      </div>

      {/* Define connection handles */}
      <Handle type="target" position={Position.Left} id="left" style={{ background: "#555" }} />
      <Handle type="source" position={Position.Right} id="right" style={{ background: "#555" }} />
    </div>
  );
};

export const TableBoxNode: React.FC<{ data: TableBoxProps }> = ({ data }) => {
  return <TableBox {...data} />;
};
