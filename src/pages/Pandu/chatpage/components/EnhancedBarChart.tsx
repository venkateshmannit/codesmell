import type React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"

interface BarChartProps {
  data: any[]
  xKey: string
  yKey: string
  title?: string
}

const EnhancedBarChart: React.FC<BarChartProps> = ({ data, xKey, yKey, title }) => {
  // Generate a gradient of colors for the bars
  const colors = ["#8884d8", "#9370DB", "#9966CC", "#8A2BE2", "#9932CC", "#BA55D3", "#DA70D6"]

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
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey={xKey} angle={-45} textAnchor="end" height={70} tick={{ fill: "#6B7280", fontSize: 12 }} />
          <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            cursor={{ fill: "rgba(147, 112, 219, 0.1)" }}
          />
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
                fill={colors[index % colors.length]}
                className="hover:opacity-80 transition-opacity duration-300"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default EnhancedBarChart

