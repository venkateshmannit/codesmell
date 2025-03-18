// src/pages/Pandu/modeling/ModelingFlow.tsx
"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactFlow, {
  Background,
  Panel,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  MarkerType,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { TableBoxNode } from "./components/TableBox";
import Sidebar from "./components/Sidebar";
import Header1 from "../../../components/Header1";
import SlidingSidePanel from "./components/SlidingSidePanel";
import {
  Search,
  Save,
  Share,
  ArrowRight,
  Loader2,
  RotateCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { toPng } from "html-to-image";

// --- Interfaces & Helper Functions ---

export interface TableData {
  name: string;
  columns: {
    name: string;
    type: string;
    __typename?: string;
    isPrimaryKey?: boolean;
    isForeignKey?: boolean;
    references?: {
      table: string;
      column: string;
    } | null;
  }[];
  __typename?: string;
}

export interface Relationship {
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  relationType: "one-to-many" | "many-to-one" | "one-to-one" | "many-to-many";
}

const guessPrimaryTableForColumn = (
  colName: string,
  tables: TableData[]
): TableData | null => {
  const prefix = colName.split("_")[0].toLowerCase();
  return (
    tables.find((t) =>
      t.name.replace("public.", "").toLowerCase().startsWith(prefix)
    ) || null
  );
};

const detectTableRelationships = (tables: TableData[]): Relationship[] => {
  const relationships: Relationship[] = [];
  const columnFrequency = new Map<string, number>();

  tables.forEach((table) => {
    table.columns.forEach((col) => {
      columnFrequency.set(col.name, (columnFrequency.get(col.name) || 0) + 1);
    });
  });

  const isJoinTable = (table: TableData): boolean => {
    const tableName = table.name.toLowerCase();
    if (!tableName.includes("_")) return false;
    let commonCount = 0;
    table.columns.forEach((col) => {
      if ((columnFrequency.get(col.name) || 0) > 1) commonCount++;
    });
    return commonCount >= 2;
  };

  const processedEdges = new Set<string>();

  tables.forEach((sourceTable) => {
    sourceTable.columns.forEach((column) => {
      if (column.isPrimaryKey || column.name === "id") return;
      let isFK = false;
      let targetTableName: string | null = null;
      let targetColumn = "id";
      let relationType: Relationship["relationType"] = "many-to-one";

      if (column.isForeignKey && column.references) {
        isFK = true;
        targetTableName = column.references.table;
        targetColumn = column.references.column;
      } else if (column.name.endsWith("_id")) {
        const baseName = column.name.slice(0, -3);
        const matchingTable = tables.find(
          (t) =>
            t.name.toLowerCase() === baseName.toLowerCase() ||
            t.name.toLowerCase() === `${baseName.toLowerCase()}s`
        );
        if (matchingTable) {
          isFK = true;
          targetTableName = matchingTable.name;
        }
      }

      if (isFK && targetTableName) {
        const key = `${sourceTable.name}-${column.name}->${targetTableName}`;
        if (!processedEdges.has(key)) {
          processedEdges.add(key);
          relationships.push({
            sourceTable: sourceTable.name,
            sourceColumn: column.name,
            targetTable: targetTableName,
            targetColumn,
            relationType,
          });
        }
      }
    });
  });

  tables.forEach((sourceTable) => {
    if (isJoinTable(sourceTable)) {
      sourceTable.columns.forEach((column) => {
        if ((columnFrequency.get(column.name) || 0) > 1) {
          const targetTable = guessPrimaryTableForColumn(column.name, tables);
          if (targetTable && targetTable.name !== sourceTable.name) {
            const key = `${sourceTable.name}-${column.name}->${targetTable.name}`;
            if (!processedEdges.has(key)) {
              processedEdges.add(key);
              relationships.push({
                sourceTable: sourceTable.name,
                sourceColumn: column.name,
                targetTable: targetTable.name,
                targetColumn: column.name,
                relationType: "many-to-many",
              });
            }
          }
        }
      });
    } else {
      sourceTable.columns.forEach((column) => {
        if ((columnFrequency.get(column.name) || 0) > 1) {
          const targetTable = guessPrimaryTableForColumn(column.name, tables);
          if (targetTable && targetTable.name !== sourceTable.name) {
            const key = `${sourceTable.name}-${column.name}->${targetTable.name}`;
            if (!processedEdges.has(key)) {
              processedEdges.add(key);
              relationships.push({
                sourceTable: sourceTable.name,
                sourceColumn: column.name,
                targetTable: targetTable.name,
                targetColumn: column.name,
                relationType: "many-to-one",
              });
            }
          }
        }
      });
    }
  });

  return relationships;
};

const getMarkerEnd = (
  relationType: "one-to-many" | "many-to-one" | "one-to-one" | "many-to-many"
) => {
  if (relationType === "one-to-one" || relationType === "many-to-many") {
    return { type: MarkerType.Arrow, width: 15, height: 15, color: "#6366f1" };
  }
  return { type: MarkerType.ArrowClosed, width: 15, height: 15, color: "#6366f1" };
};

const generateRelationshipEdges = (tables: TableData[]): Edge[] => {
  const relationships = detectTableRelationships(tables);
  let edgeId = 0;
  return relationships.map((rel) => ({
    id: `edge-${edgeId++}`,
    source: rel.sourceTable,
    target: rel.targetTable,
    sourceHandle: "right",
    targetHandle: "left",
    type: "smoothstep",
    animated: false,
    style: { stroke: "#6366f1", strokeWidth: 2 },
    label: rel.sourceColumn,
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: {
      fill: "#f8fafc",
      fillOpacity: 0.8,
      stroke: "#6366f1",
      strokeWidth: 1,
    },
    labelStyle: { fill: "#475569", fontWeight: 500, fontSize: 11 },
    markerEnd: getMarkerEnd(rel.relationType),
  }));
};

const getGridLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  colCount: number = 4
) => {
  const nodeWidth = 280;
  const nodeHeight = 220;
  const marginX = 50;
  const marginY = 50;

  const layoutedNodes = nodes.map((node, index) => {
    const colIndex = index % colCount;
    const rowIndex = Math.floor(index / colCount);
    return {
      ...node,
      position: {
        x: marginX + colIndex * (nodeWidth + marginX),
        y: marginY + rowIndex * (nodeHeight + marginY),
      },
      data: {
        ...node.data,
        gridPosition: {
          x: marginX + colIndex * (nodeWidth + marginX),
          y: marginY + rowIndex * (nodeHeight + marginY),
        },
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// --- Main Component ---

interface ModelingData {
  selectedTables: string[];
  connectionDetails: any;
  projectName: string;
}

const ModelingFlow: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Load modelingData from location state (if available) or localStorage.
  const [modelingData, setModelingData] = useState<ModelingData | null>(() => {
    if (location.state && Object.keys(location.state).length > 0) {
      return location.state as ModelingData;
    }
    const stored = localStorage.getItem("modelingData");
    return stored ? JSON.parse(stored) : null;
  });

  // If modelingData is missing or incomplete, redirect to connection page.
  useEffect(() => {
    if (
      !modelingData ||
      !modelingData.selectedTables ||
      modelingData.selectedTables.length === 0 ||
      !modelingData.connectionDetails ||
      !modelingData.projectName
    ) {
      toast.error("Missing modeling data. Redirecting to connection page.");
      navigate("/dataconnection");
    } else {
      // Ensure modelingData persists in localStorage.
      localStorage.setItem("modelingData", JSON.stringify(modelingData));
    }
  }, [modelingData, navigate]);

  const { selectedTables, connectionDetails, projectName } = modelingData!;

  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshSignal, setRefreshSignal] = useState<number>(0);

  const handleRefresh = () => {
    setRefreshSignal((prev) => prev + 1);
  };

  const nodeTypes = useMemo(() => ({ tableBox: TableBoxNode }), []);

  const handleSave = () => {
    if (!reactFlowWrapper.current) return;
    toPng(reactFlowWrapper.current)
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "diagram.png";
        link.href = dataUrl;
        link.click();
        toast.success("Diagram saved as PNG");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error saving diagram as PNG");
      });
  };

  const handleShare = async () => {
    if (!navigator.share) {
      toast.error("Web Share API is not supported in this browser");
      return;
    }
    if (!reactFlowWrapper.current) return;
    try {
      const dataUrl = await toPng(reactFlowWrapper.current);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "diagram.png", { type: blob.type });
      await navigator.share({
        files: [file],
        title: "Diagram",
        text: "Check out this diagram!",
      });
    } catch (err) {
      console.error(err);
      toast.error("Error sharing diagram");
    }
  };

  // Fetch table data from localStorage ("tableData") and filter based on selected tables.
  useEffect(() => {
    const storedTableData = localStorage.getItem("tableData");
    if (!storedTableData) {
      toast.error("No table data found in memory. Please reconnect your data source.");
      setLoading(false);
      return;
    }
    let allTables: TableData[];
    try {
      allTables = JSON.parse(storedTableData);
    } catch (err) {
      console.error("Error parsing tableData:", err);
      toast.error("Invalid table data stored in memory.");
      setLoading(false);
      return;
    }
    const filteredTables = allTables.filter((table) =>
      selectedTables.includes(table.name)
    );
    if (filteredTables.length === 0) {
      toast.error("No matching tables found for modeling. Please check your selection.");
      setLoading(false);
      return;
    }
    const newNodes: Node[] = filteredTables.map((table: TableData) => {
      const formattedColumns = table.columns.map((col) => ({
        name: col.name,
        type: col.type,
        required: col.isPrimaryKey || col.name === "id",
        key: col.isPrimaryKey || col.name === "id",
        foreignKey: col.isForeignKey,
      }));
      const relations =
        table.columns
          .filter((col) => col.isForeignKey && col.references)
          .map((col) => ({
            type: `References ${col.references?.table} via ${col.name}`,
          })) || [];
      return {
        id: table.name,
        type: "tableBox",
        data: {
          title: table.name,
          columns: formattedColumns,
          sections: [{ title: "Total Columns", count: table.columns.length }],
          relations,
          projectName,
          connectionDetails,
        },
        position: { x: 0, y: 0 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });
    const newEdges = generateRelationshipEdges(filteredTables);
    const { nodes: layoutedNodes, edges: layoutedEdges } =
      getGridLayoutedElements(newNodes, newEdges, 4);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setLoading(false);
  }, [selectedTables, connectionDetails, projectName, refreshSignal]);

  const onNodeDragStop = useCallback((event: any, node: Node) => {
    console.log("Drag Stop:", node);
  }, []);

  const onNodeClick = useCallback((event: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  const handleChatNavigation = () => {
    navigate("/panduchat");
  };

  const handleRelayout = () => {
    if (nodes.length === 0) return;
    const { nodes: layoutedNodes, edges: layoutedEdges } = getGridLayoutedElements(
      nodes,
      edges,
      4
    );
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
    toast.success("Tables have been re-laid out in a 4-col grid");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {/* Fixed Header */}
      <div className="w-full fixed top-0 left-0 z-50">
        <Header1 />
      </div>
      <div className="flex h-screen">
        <Sidebar refreshSignal={refreshSignal} />
        <div className="relative flex-1 h-full" ref={reactFlowWrapper}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
              <p className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
                Loading tables and analyzing relationships...
              </p>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeDragStop={onNodeDragStop}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2, includeHiddenNodes: false }}
              snapToGrid
              snapGrid={[20, 20]}
              connectionLineType={ConnectionLineType.SmoothStep}
              defaultEdgeOptions={{
                type: "smoothstep",
                style: { stroke: "#6366f1", strokeWidth: 2 },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  width: 15,
                  height: 15,
                  color: "#6366f1",
                },
              }}
            >
              <Background color="#94a3b8" gap={20} size={1} />
              {/* Top Left Panel */}
              <Panel
                position="top-left"
                className="ml-5 mt-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-2"
              >
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search tables..."
                      className="pl-8 pr-3 py-1.5 text-sm bg-transparent border-none focus:outline-none focus:ring-0 w-48 text-slate-700 dark:text-slate-300"
                    />
                  </div>
                  <button
                    onClick={handleRefresh}
                    className="p-2 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                  >
                    <RotateCw size={18} />
                  </button>
                </div>
              </Panel>
              {/* Top Right Panel */}
              <Panel
                position="top-right"
                style={{
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%)",
                }}
              >
                <button
                  onClick={handleChatNavigation}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <ArrowRight className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </button>
              </Panel>
              {/* Bottom Right Panel */}
              <Panel position="bottom-right" className="mr-2 mb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRelayout}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium flex items-center gap-1"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V5Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M9 9H15M9 12H15M9 15H12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>Re-layout Tables</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium flex items-center gap-1"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 border border-purple-600 hover:border-purple-700 rounded-lg shadow-sm text-white transition-colors text-sm font-medium flex items-center gap-1"
                  >
                    <Share className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </Panel>
            </ReactFlow>
          )}
          {selectedNode && (
            <SlidingSidePanel
              selectedNode={selectedNode}
              onClose={() => setSelectedNode(null)}
              onUpdateNode={(updatedNode: Node) => {
                setNodes((nds) =>
                  nds.map((node) =>
                    node.id === updatedNode.id ? updatedNode : node
                  )
                );
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelingFlow;
