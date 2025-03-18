"use client"

import type React from "react"
import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts"

interface AdvancedBarChartProps {
  data: any[]
  xKey: string
  yKey: string
  title?: string
}

const AdvancedBarChart: React.FC<AdvancedBarChartProps> = ({ data, xKey, yKey, title }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // Generate a gradient of colors for the bars
  const colors = ["#8884d8", "#9370DB", "#9966CC", "#8A2BE2", "#9932CC", "#BA55D3", "#DA70D6"]

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-purple-200 rounded-md shadow-lg">
          <p className="font-medium text-purple-800">{`${label}`}</p>
          <p className="text-purple-600">{`${payload[0].name}: ${payload[0].value.toLocaleString()}`}</p>
        </div>
      )
    }
    return null
  }

  // Handle mouse events for hover effects
  const handleMouseEnter = (data: any, index: number) => {
    setActiveIndex(index)
  }

  const handleMouseLeave = () => {
    setActiveIndex(null)
  }

  return (
    <div className="w-full">
      {title && <h3 className="text-center text-lg font-medium text-purple-800 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
          barSize={40}
          className="text-sm"
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {colors.map((color, index) => (
              <linearGradient key={`gradient-${index}`} id={`colorGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey={xKey} angle={-45} textAnchor="end" height={70} tick={{ fill: "#6B7280", fontSize: 12 }} />
          <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} tickFormatter={(value) => value.toLocaleString()} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: "10px",
            }}
          />
          <Bar
            dataKey={yKey}
            name={yKey.charAt(0).toUpperCase() + yKey.slice(1)}
            radius={[4, 4, 0, 0]}
            animationDuration={1500}
            animationEasing="ease-in-out"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`url(#colorGradient${index % colors.length})`}
                stroke={colors[index % colors.length]}
                strokeWidth={activeIndex === index ? 2 : 1}
                onMouseEnter={() => handleMouseEnter(entry, index)}
                style={{
                  filter: activeIndex === index ? "drop-shadow(0 0 6px rgba(138, 43, 226, 0.5))" : "none",
                  transition: "filter 0.3s ease-in-out, opacity 0.3s ease-in-out",
                  opacity: activeIndex === null || activeIndex === index ? 1 : 0.7,
                  cursor: "pointer",
                }}
              />
            ))}
            <LabelList
              dataKey={yKey}
              position="top"
              style={{ fontSize: 12, fill: "#6B7280" }}
              formatter={(value: number) => value.toLocaleString()}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default AdvancedBarChart

