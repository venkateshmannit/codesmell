"use client"

import type React from "react"
import { useMemo, useCallback, useState } from "react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  Panel,
} from "reactflow"
import "reactflow/dist/style.css"
import { TableBoxNode } from "./components/TableBox"
import Sidebar from "./components/Sidebar"
import Header1 from "../../components/Header1"
import SlidingSidePanel from "./components/SlidingSidePanel"
import { Search, ZoomIn, ZoomOut, Maximize, Grid, Save, Share } from "lucide-react"

const ModelingFlow: React.FC = () => {
  const nodeTypes = useMemo(() => ({ tableBox: TableBoxNode }), [])

  const initialNodes: Node[] = [
    {
      id: "customers",
      type: "tableBox",
      data: {
        title: "customers",
        columns: [
          { name: "customer_city", required: true },
          { name: "customer_id", required: true },
          { name: "customer_name", required: true },
          { name: "customer_unique_id", required: true },
          { name: "customer_zip_code_prefix", required: true },
        ],
        sections: [
          { title: "Calculated Fields", count: 0 },
          { title: "Relationships", count: 0 },
        ],
        relations: [{ type: "orders" }, { type: "geolocation" }],
      },
      position: { x: 320, y: 24 },
      style: { margin: "20px" },
    },
    {
      id: "order_items",
      type: "tableBox",
      data: {
        title: "order items",
        columns: [
          { name: "freight_value", required: true },
          { name: "order_item_id", required: true, key: true },
          { name: "price", required: true },
          { name: "product_id", required: true },
          { name: "order_id", required: true },
          { name: "shipping_limit_date", required: false },
        ],
        sections: [
          { title: "Calculated Fields", count: 0 },
          { title: "Relationships", count: 0 },
        ],
        relations: [{ type: "orders" }, { type: "products" }, { type: "sellers" }],
      },
      position: { x: 550, y: 24 },
      style: { margin: "20px" },
    },
    {
      id: "orders",
      type: "tableBox",
      data: {
        title: "orders",
        columns: [
          { name: "customer_id", required: true },
          { name: "order_approved_at", required: true },
          { name: "order_delivered_carrier_date", required: false },
          { name: "order_delivered_customer_date", required: false },
          { name: "order_estimated_delivery_date", required: false },
          { name: "order_id", required: true },
          { name: "order_purchase_timestamp", required: false },
          { name: "order_status", required: true },
        ],
        sections: [
          { title: "Calculated Fields", count: 0 },
          { title: "Relationships", count: 0 },
        ],
        relations: [
          { type: "customers" },
          { type: "order items" },
          { type: "order reviews" },
          { type: "order payments" },
        ],
      },
      position: { x: 780, y: 24 },
      style: { margin: "20px" },
    },
    {
      id: "order_payments",
      type: "tableBox",
      data: {
        title: "order payments",
        columns: [
          { name: "order_id", required: true },
          { name: "payment_installments", required: true },
          { name: "payment_sequential", required: true },
          { name: "payment_type", required: true },
          { name: "payment_value", required: true },
        ],
        sections: [
          { title: "Calculated Fields", count: 0 },
          { title: "Relationships", count: 0 },
        ],
        relations: [{ type: "orders" }],
      },
      position: { x: 1010, y: 24 },
      style: { margin: "20px" },
    },
    {
      id: "products",
      type: "tableBox",
      data: {
        title: "products",
        columns: [
          { name: "product_category_name", required: true },
          { name: "product_description_length", required: true },
          { name: "product_height_cm", required: true },
          { name: "product_id", required: true, key: true },
          { name: "product_length_cm", required: true },
          { name: "product_name_length", required: true },
          { name: "product_photos_qty", required: true },
          { name: "product_weight_g", required: true },
          { name: "product_width_cm", required: true },
        ],
        sections: [
          { title: "Calculated Fields", count: 0 },
          { title: "Relationships", count: 0 },
        ],
        relations: [{ type: "product category translation" }, { type: "order items" }],
      },
      position: { x: 320, y: 310 },
      style: { margin: "20px" },
    },
    {
      id: "order_reviews",
      type: "tableBox",
      data: {
        title: "order reviews",
        columns: [
          { name: "order_id", required: true },
          { name: "review_answer_timestamp", required: false },
          { name: "review_comment_message", required: true },
          { name: "review_comment_title", required: true },
          { name: "review_creation_date", required: true },
          { name: "review_id", required: true, key: true },
          { name: "review_score", required: true },
        ],
        sections: [
          { title: "Calculated Fields", count: 0 },
          { title: "Relationships", count: 0 },
        ],
        relations: [{ type: "orders" }],
      },
      position: { x: 550, y: 310 },
      style: { margin: "20px" },
    },
    {
      id: "geolocation",
      type: "tableBox",
      data: {
        title: "geolocation",
        columns: [
          { name: "geolocation_city", required: true },
          { name: "geolocation_id", required: true },
          { name: "geolocation_lat", required: true },
          { name: "geolocation_lng", required: true },
          { name: "geolocation_state", required: true },
          { name: "geolocation_zip_code_prefix", required: true },
        ],
        sections: [
          { title: "Calculated Fields", count: 0 },
          { title: "Relationships", count: 0 },
        ],
        relations: [{ type: "customers" }, { type: "sellers" }],
      },
      position: { x: 780, y: 310 },
      style: { margin: "20px" },
    },
    {
      id: "sellers",
      type: "tableBox",
      data: {
        title: "sellers",
        columns: [
          { name: "seller_city", required: true },
          { name: "seller_id", required: true },
          { name: "seller_state", required: true },
          { name: "seller_zip_code_prefix", required: true },
        ],
        sections: [
          { title: "Calculated Fields", count: 0 },
          { title: "Relationships", count: 0 },
        ],
        relations: [{ type: "order items" }, { type: "geolocation" }],
      },
      position: { x: 1010, y: 310 },
      style: { margin: "20px" },
    },
    {
      id: "product_category_translation",
      type: "tableBox",
      data: {
        title: "product category translation",
        columns: [
          { name: "product_category_name", required: true },
          { name: "product_category_name_english", required: true },
        ],
        sections: [
          { title: "Calculated Fields", count: 0 },
          { title: "Relationships", count: 0 },
        ],
        relations: [{ type: "products" }],
      },
      position: { x: 320, y: 585 },
      style: { margin: "20px" },
    },
  ]

  const initialEdges: Edge[] = [
    {
      id: "e-customers-orders",
      source: "customers",
      target: "orders",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#6366f1", strokeWidth: 2 },
    },
    {
      id: "e-customers-geolocation",
      source: "customers",
      target: "geolocation",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#6366f1", strokeWidth: 2 },
    },
    {
      id: "e-order_items-orders",
      source: "order_items",
      target: "orders",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#6366f1", strokeWidth: 2 },
    },
    {
      id: "e-order_items-products",
      source: "order_items",
      target: "products",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#6366f1", strokeWidth: 2 },
    },
    {
      id: "e-order_items-sellers",
      source: "order_items",
      target: "sellers",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#6366f1", strokeWidth: 2 },
    },
    {
      id: "e-orders-customers",
      source: "orders",
      target: "customers",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#6366f1", strokeWidth: 2 },
    },
    {
      id: "e-orders-order_items",
      source: "orders",
      target: "order_items",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#6366f1", strokeWidth: 2 },
    },
    {
      id: "e-orders-order_reviews",
      source: "orders",
      target: "order_reviews",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#6366f1", strokeWidth: 2 },
    },
    {
      id: "e-orders-order_payments",
      source: "orders",
      target: "order_payments",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#6366f1", strokeWidth: 2 },
    },
    {
      id: "e-order_payments-orders",
      source: "order_payments",
      target: "orders",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#6366f1", strokeWidth: 2 },
    },
    {
      id: "e-products-translation",
      source: "products",
      target: "product_category_translation",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#6366f1", strokeWidth: 2 },
    },
    {
      id: "e-products-order_items",
      source: "products",
      target: "order_items",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#6366f1", strokeWidth: 2 },
    },
    {
      id: "e-order_reviews-orders",
      source: "order_reviews",
      target: "orders",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#6366f1", strokeWidth: 2 },
    },
    {
      id: "e-geolocation-customers",
      source: "geolocation",
      target: "customers",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#6366f1", strokeWidth: 2 },
    },
    {
      id: "e-geolocation-sellers",
      source: "geolocation",
      target: "sellers",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#6366f1", strokeWidth: 2 },
    },
    {
      id: "e-sellers-order_items",
      source: "sellers",
      target: "order_items",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#6366f1", strokeWidth: 2 },
    },
    {
      id: "e-sellers-geolocation",
      source: "sellers",
      target: "geolocation",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#6366f1", strokeWidth: 2 },
    },
    {
      id: "e-translation-products",
      source: "product_category_translation",
      target: "products",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#6366f1", strokeWidth: 2 },
    },
  ]

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  const onNodeDragStop = useCallback((event, node) => {
    console.log("Drag Stop:", node)
  }, [])

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {/* Full-width fixed header */}
      <div className="w-full fixed top-0 left-0 z-50">
        <Header1 />
      </div>

      <div className="flex h-screen mt-16">
        <Sidebar />
        <div className="relative flex-1 h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDragStop={onNodeDragStop}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            connectionLineType={ConnectionLineType.SmoothStep}
            defaultEdgeOptions={{
              type: "smoothstep",
              style: { stroke: "#6366f1", strokeWidth: 2 },
            }}
          >
            <Background color="#94a3b8" gap={20} size={1} />
            <Controls className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-1" />
            <MiniMap
              nodeStrokeColor="#0f172a"
              nodeColor="#f8fafc"
              nodeBorderRadius={2}
              maskColor="rgba(240, 242, 245, 0.7)"
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm"
            />

            <Panel position="top-left" className="ml-2 mt-2">
              <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-1">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search models..."
                    className="pl-8 pr-3 py-1.5 text-sm bg-transparent border-none focus:outline-none focus:ring-0 w-48 text-slate-700 dark:text-slate-300"
                  />
                </div>
              </div>
            </Panel>

            <Panel position="top-right" className="mr-2 mt-2">
              <div className="flex items-center gap-2">
                <button className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <Grid className="w-4 h-4" />
                </button>
                <button className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </Panel>

            <Panel position="bottom-right" className="mr-2 mb-2">
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium flex items-center gap-1">
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 border border-indigo-600 hover:border-indigo-700 rounded-lg shadow-sm text-white transition-colors text-sm font-medium flex items-center gap-1">
                  <Share className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </Panel>
          </ReactFlow>

          {selectedNode && <SlidingSidePanel selectedNode={selectedNode} onClose={() => setSelectedNode(null)} />}
        </div>
      </div>
    </div>
  )
}

export default ModelingFlow

