import { Node, Edge } from "reactflow";

export const initialNodes: Node[] = [
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
      relations: [
        { type: "product category translation" },
        { type: "order items" },
      ],
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
];

export const initialEdges: Edge[] = [
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
];
