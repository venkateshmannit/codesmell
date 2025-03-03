import React from "react";
import { Node } from "reactflow";

interface SlidingSidePanelProps {
  selectedNode: Node;
  onClose: () => void;
}

const SlidingSidePanel: React.FC<SlidingSidePanelProps> = ({ selectedNode, onClose }) => {
  return (
    <div
      className="fixed left-0 top-0 bottom-0 z-10 transition-transform duration-300 mt-16"
      style={{ transform: "translateX(0)" }}
    >
      <div className="w-[750px] bg-white rounded-md shadow-md overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <span className="text-gray-700 font-medium">{selectedNode.data.title}</span>
          </div>
          <button className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            <span className="text-sm">Edit</span>
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <div className="text-sm text-gray-500">Name</div>
            <div className="text-sm">{selectedNode.data.title}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Alias</div>
            <div className="text-sm">{selectedNode.data.alias || selectedNode.data.title}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Description</div>
            <div className="text-sm text-gray-800">
              {selectedNode.data.description ||
                "No description provided for this table."}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-2">
              Columns ({selectedNode.data.columns.length})
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alias
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedNode.data.columns.map((col: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">{col.name}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {col.alias || col.name}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 mr-1">
                            {col.required ? "+" : "-"}
                          </span>
                          <span>{col.type || "VARCHAR"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {col.description || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-2">
              Relationships ({selectedNode.data.relations.length})
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      From
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      To
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedNode.data.relations.map((rel: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">{rel.name || "-"}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">{rel.from || "-"}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">{rel.to || "-"}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">{rel.type || "-"}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">{rel.description || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-2">Data preview (100 rows)</div>
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
              Preview data
            </button>
            <div className="mt-8 flex flex-col items-center justify-center h-32">
              <div className="w-12 h-12 mb-3 text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                  <path d="M14 17H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </div>
              <div className="text-sm text-gray-500">No Data</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlidingSidePanel;
