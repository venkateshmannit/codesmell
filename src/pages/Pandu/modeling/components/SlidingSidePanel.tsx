"use client";

import React, { useEffect, useState } from "react";
import type { Node } from "reactflow";
import { ChevronLeft, Edit, Plus, Database } from "lucide-react";
import toast from "react-hot-toast";
import { previewTableData, listTableDetails } from "./../../../../api/table"; // adjust path as needed

interface SlidingSidePanelProps {
  selectedNode: Node;
  onClose: () => void;
  onUpdateNode: (updatedNode: Node) => void;
}

const SlidingSidePanel: React.FC<SlidingSidePanelProps> = ({
  selectedNode,
  onClose,
  onUpdateNode,
}) => {
  // Extract initial data from the selected node
  const initialData = selectedNode.data || {};
  const [editableData, setEditableData] = useState({
    title: initialData.title || "Untitled",
    alias: initialData.alias || initialData.title || "Untitled",
    description: initialData.description || "",
    columns: initialData.columns || [],
    relations: initialData.relations || [],
  });

  // State to hold available table names and loading flag
  const [tableNames, setTableNames] = useState<string[]>([]);
  const [loadingTables, setLoadingTables] = useState<boolean>(true);
  useEffect(() => {
    const fetchTableNames = async () => {
      setLoadingTables(true);
      try {
        const result = await listTableDetails();
        if (result?.data?.listDataSourceTables) {
          // Extract table names and remove the "public." prefix if present.
          const names = result.data.listDataSourceTables.map((table: any) =>
            table.name.replace(/^public\./, "")
          );
          setTableNames(names);
        }
      } catch (error) {
        console.error("Error fetching table names:", error);
      } finally {
        setLoadingTables(false);
      }
    };
    fetchTableNames();
  }, []);

  // State to toggle table detail editing
  const [isEditingTable, setIsEditingTable] = useState(false);

  // States for adding a new column
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumn, setNewColumn] = useState({ name: "", alias: "", type: "VARCHAR" });

  // States for editing an existing column
  const [editingColumnIndex, setEditingColumnIndex] = useState<number | null>(null);
  const [editingColumnData, setEditingColumnData] = useState({ name: "", alias: "", type: "VARCHAR" });

  // States for adding a new relationship
  const [showAddRelationship, setShowAddRelationship] = useState(false);
  const [newRelationship, setNewRelationship] = useState({
    name: "",
    // Pre-fill "from" with the current table name
    from: editableData.title,
    to: "",
    type: "",
    description: "",
  });

  // States for data preview modal
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  // ----- Table Detail Handlers -----
  const handleSaveTableDetails = () => {
    const updatedNode = { ...selectedNode, data: editableData };
    onUpdateNode(updatedNode);
    setIsEditingTable(false);
  };

  // ----- Column Handlers -----
  const handleAddColumn = () => {
    if (newColumn.name.trim() === "") return;
    const updatedColumns = [...editableData.columns, newColumn];
    const updatedData = { ...editableData, columns: updatedColumns };
    setEditableData(updatedData);
    onUpdateNode({ ...selectedNode, data: updatedData });
    setNewColumn({ name: "", alias: "", type: "VARCHAR" });
    setShowAddColumn(false);
  };

  const handleEditColumn = (index: number) => {
    const col = editableData.columns[index];
    setEditingColumnIndex(index);
    setEditingColumnData({ name: col.name, alias: col.alias || col.name, type: col.type || "VARCHAR" });
  };

  const handleSaveEditedColumn = () => {
    if (editingColumnIndex === null) return;
    const updatedColumns = [...editableData.columns];
    updatedColumns[editingColumnIndex] = editingColumnData;
    const updatedData = { ...editableData, columns: updatedColumns };
    setEditableData(updatedData);
    onUpdateNode({ ...selectedNode, data: updatedData });
    setEditingColumnIndex(null);
    setEditingColumnData({ name: "", alias: "", type: "VARCHAR" });
  };

  // ----- Relationship Handlers -----
  const handleAddRelationship = () => {
    if (
      newRelationship.name.trim() === "" ||
      newRelationship.to.trim() === "" ||
      !newRelationship.type
    ) {
      toast.error("Please fill in all required relationship fields.");
      return;
    }
    const updatedRelations = [...editableData.relations, newRelationship];
    const updatedData = { ...editableData, relations: updatedRelations };
    setEditableData(updatedData);
    onUpdateNode({ ...selectedNode, data: updatedData });
    // Reset the relationship form (prefill "from" with current table name)
    setNewRelationship({
      name: "",
      from: editableData.title,
      to: "",
      type: "",
      description: "",
    });
    setShowAddRelationship(false);
  };

  // ----- Data Preview Handler -----
  const handlePreviewData = async () => {
    try {
      const result = await previewTableData(editableData.title);
      if (result.data && result.data.previewTableData) {
        setPreviewData(result.data.previewTableData.rows);
        setShowDataPreview(true);
      } else {
        toast.error("Failed to fetch table data preview.");
      }
    } catch (error) {
      console.error("Error fetching preview data:", error);
      toast.error("Error fetching preview data.");
    }
  };

  return (
    <div
      className="fixed right-0 top-0 bottom-0 z-10 transition-transform duration-300 mt-12 h-[calc(100vh-4rem)]"
      style={{ transform: "translateX(0)" }}
    >
      <div className="w-[750px] h-full bg-white dark:bg-slate-900 rounded-r-lg shadow-xl overflow-hidden border-r border-t border-b border-slate-200 dark:border-slate-700 flex flex-col">
        {/* Header with Table Info & Edit Toggle */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center">
              <Database className="w-4 h-4 mr-2 text-purple-500" />
              {isEditingTable ? (
                <input
                  type="text"
                  value={editableData.title}
                  onChange={(e) =>
                    setEditableData({ ...editableData, title: e.target.value })
                  }
                  className="text-slate-700 dark:text-slate-200 font-medium bg-transparent border-b border-slate-300 dark:border-slate-600 focus:outline-none"
                />
              ) : (
                <span className="text-slate-700 dark:text-slate-200 font-medium">
                  {editableData.title}
                </span>
              )}
            </div>
          </div>
          {isEditingTable ? (
            <button
              onClick={handleSaveTableDetails}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Save</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditingTable(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {/* Main Panel */}
        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          {/* Table Details */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Name</div>
              {isEditingTable ? (
                <input
                  type="text"
                  value={editableData.title}
                  onChange={(e) =>
                    setEditableData({ ...editableData, title: e.target.value })
                  }
                  className="text-sm text-slate-800 dark:text-slate-200 font-medium bg-transparent border-b border-slate-300 dark:border-slate-600 focus:outline-none"
                />
              ) : (
                <div className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                  {editableData.title}
                </div>
              )}
            </div>
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Alias</div>
              {isEditingTable ? (
                <input
                  type="text"
                  value={editableData.alias}
                  onChange={(e) =>
                    setEditableData({ ...editableData, alias: e.target.value })
                  }
                  className="text-sm text-slate-800 dark:text-slate-200 font-medium bg-transparent border-b border-slate-300 dark:border-slate-600 focus:outline-none"
                />
              ) : (
                <div className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                  {editableData.alias}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Description</div>
            {isEditingTable ? (
              <textarea
                value={editableData.description}
                onChange={(e) =>
                  setEditableData({ ...editableData, description: e.target.value })
                }
                className="text-sm text-slate-700 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 focus:outline-none w-full"
              />
            ) : (
              <div className="text-sm text-slate-700 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                {editableData.description || "No description provided for this table."}
              </div>
            )}
          </div>

          {/* Columns Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Columns ({editableData.columns.length})
              </div>
              <button
                onClick={() => setShowAddColumn(!showAddColumn)}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add column</span>
              </button>
            </div>
            {showAddColumn && (
              <div className="mb-4 p-2 border border-dashed border-slate-300 rounded-md">
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Column name"
                    value={newColumn.name}
                    onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
                    className="p-1 border border-slate-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Alias"
                    value={newColumn.alias}
                    onChange={(e) => setNewColumn({ ...newColumn, alias: e.target.value })}
                    className="p-1 border border-slate-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Type"
                    value={newColumn.type}
                    onChange={(e) => setNewColumn({ ...newColumn, type: e.target.value })}
                    className="p-1 border border-slate-300 rounded"
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <button onClick={handleAddColumn} className="px-3 py-1 bg-green-500 text-white rounded">
                    Save Column
                  </button>
                </div>
              </div>
            )}
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
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-8"></th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                  {editableData.columns.map((col: any, index: number) => (
                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-3 py-2 whitespace-nowrap">
                        {editingColumnIndex === index ? (
                          <button onClick={handleSaveEditedColumn} className="text-green-500">
                            Save
                          </button>
                        ) : (
                          <button onClick={() => handleEditColumn(index)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                            <Edit className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                        {editingColumnIndex === index ? (
                          <input
                            type="text"
                            value={editingColumnData.name}
                            onChange={(e) =>
                              setEditingColumnData({ ...editingColumnData, name: e.target.value })
                            }
                            className="p-1 border border-slate-300 rounded"
                          />
                        ) : (
                          col.name
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                        {editingColumnIndex === index ? (
                          <input
                            type="text"
                            value={editingColumnData.alias}
                            onChange={(e) =>
                              setEditingColumnData({ ...editingColumnData, alias: e.target.value })
                            }
                            className="p-1 border border-slate-300 rounded"
                          />
                        ) : (
                          col.alias || col.name
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                        {editingColumnIndex === index ? (
                          <input
                            type="text"
                            value={editingColumnData.type}
                            onChange={(e) =>
                              setEditingColumnData({ ...editingColumnData, type: e.target.value })
                            }
                            className="p-1 border border-slate-300 rounded"
                          />
                        ) : (
                          col.type || "VARCHAR"
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Relationships Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Relationships ({editableData.relations.length})
              </div>
              <button
                onClick={() => setShowAddRelationship(!showAddRelationship)}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add relationship</span>
              </button>
            </div>
            {showAddRelationship && (
              <div className="mb-4 p-2 border border-dashed border-slate-300 rounded-md">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Relationship Name"
                    value={newRelationship.name}
                    onChange={(e) =>
                      setNewRelationship({ ...newRelationship, name: e.target.value })
                    }
                    className="p-1 border border-slate-300 rounded"
                  />
                  {/* From field pre-filled and disabled */}
                  <input
                    type="text"
                    placeholder="From"
                    value={newRelationship.from}
                    disabled
                    className="p-1 border border-slate-300 rounded bg-gray-100"
                  />
                  {/* To Table dropdown with loading functionality */}
                  {loadingTables ? (
                    <select className="p-1 border border-slate-300 rounded" disabled>
                      <option>Loading...</option>
                    </select>
                  ) : (
                    <select
                      value={newRelationship.to}
                      onChange={(e) =>
                        setNewRelationship({ ...newRelationship, to: e.target.value })
                      }
                      className="p-1 border border-slate-300 rounded"
                    >
                      <option value="">Select Table</option>
                      {tableNames.map((table) => (
                        <option key={table} value={table}>
                          {table}
                        </option>
                      ))}
                    </select>
                  )}
                  {/* Dropdown for relationship type */}
                  <select
                    value={newRelationship.type}
                    onChange={(e) =>
                      setNewRelationship({ ...newRelationship, type: e.target.value })
                    }
                    className="p-1 border border-slate-300 rounded"
                  >
                    <option value="">Select Relationship Type</option>
                    <option value="one-to-one">One-to-One</option>
                    <option value="one-to-many">One-to-Many</option>
                    <option value="many-to-one">Many-to-One</option>
                    <option value="many-to-many">Many-to-many</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Description"
                    value={newRelationship.description}
                    onChange={(e) =>
                      setNewRelationship({ ...newRelationship, description: e.target.value })
                    }
                    className="p-1 border border-slate-300 rounded col-span-2"
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddRelationship}
                    className="px-3 py-1 bg-green-500 text-white rounded"
                  >
                    Save Relationship
                  </button>
                </div>
              </div>
            )}
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
                  {editableData.relations.map((rel: any, index: number) => (
                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                          <Plus className="w-3 h-3" />
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

          {/* Data Preview Section */}
          <div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Data preview (100 rows)
            </div>
            <button
              onClick={handlePreviewData}
              className="px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Preview data
            </button>
          </div>
        </div>
      </div>

      {/* Data Preview Modal */}
      {showDataPreview && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-md w-3/4 max-h-3/4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200">
                Data Preview
              </h3>
              <button
                onClick={() => setShowDataPreview(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                &times;
              </button>
            </div>
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700">
                  {previewData[0] &&
                    Object.keys(previewData[0]).map((key) => (
                      <th key={key} className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {previewData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((val, colIndex) => (
                      <td key={colIndex} className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlidingSidePanel;
