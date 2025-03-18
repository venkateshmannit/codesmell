"use client";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { CopyIcon, Check, BarChartIcon } from "lucide-react";
import AdvancedBarChart from "./AdvancedBarChart";

const buildDynamicChartSpecFromAnswer = (answer: string) => {
  const data: { label: string; value: number }[] = [];
  const regex = /([^:\n]+):\s*([\d,]+)/g;
  let match;
  while ((match = regex.exec(answer)) !== null) {
    const label = match[1].trim();
    const valueStr = match[2].replace(/,/g, "");
    const value = Number.parseFloat(valueStr);
    if (!isNaN(value) && label) {
      data.push({ label, value });
    }
  }
  if (data.length === 0) return null;
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Dynamic Chart",
    data: { values: data },
    mark: "bar",
    encoding: {
      x: { field: "label", type: "ordinal", title: "Label" },
      y: { field: "value", type: "quantitative", title: "Value" },
    },
    title: "Data Visualization",
  };
};

interface AnswerDisplayProps {
  answerText: string;
  sqlQuery: string;
  chartDetails?: {
    chartType?: string;
    chartSchema?: any;
    description?: string;
  };
}

const AnswerDisplay: React.FC<AnswerDisplayProps> = ({ answerText, sqlQuery, chartDetails }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  let finalChartDetails = chartDetails;
  if (!finalChartDetails) {
    const fallbackSpec = buildDynamicChartSpecFromAnswer(answerText);
    if (fallbackSpec) {
      finalChartDetails = {
        chartType: "BAR",
        chartSchema: fallbackSpec,
        description: "Chart generated from answer text.",
      };
    }
  }

  const transformChartData = () => {
    if (!finalChartDetails?.chartSchema?.data?.values) return [];
    const values = finalChartDetails.chartSchema.data.values;
    if (values.length > 0 && "label" in values[0] && "value" in values[0]) return values;
    try {
      const xField = finalChartDetails.chartSchema.encoding?.x?.field || "x";
      const yField = finalChartDetails.chartSchema.encoding?.y?.field || "y";
      return values.map((item: any) => ({
        label: item[xField]?.toString() || "",
        value: typeof item[yField] === "number" ? item[yField] : Number.parseFloat(item[yField]) || 0,
      }));
    } catch (error) {
      console.error("Error transforming chart data:", error);
      return [];
    }
  };

  const getChartTitle = () => finalChartDetails?.chartSchema?.title || "Data Visualization";
  const chartData = transformChartData();

  return (
    <div className="space-y-6 bg-white rounded-lg border border-purple-100 shadow-sm p-6 transition-all duration-300 hover:shadow-md">
      <div>
        <h3 className="text-xl font-bold text-purple-800 mb-3 flex items-center">
          <span className="bg-purple-100 p-1.5 rounded-md mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
          Answer
        </h3>
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{answerText}</ReactMarkdown>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-md font-medium text-gray-700 flex items-center">
            <span className="bg-purple-100 p-1 rounded-md mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </span>
            SQL Query
          </h4>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-1 text-xs rounded transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <CopyIcon className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <div className="relative">
          <pre className="bg-gray-800 text-white font-mono p-4 rounded-md overflow-auto text-sm max-h-60">
            {sqlQuery}
          </pre>
        </div>
      </div>
      {finalChartDetails && chartData.length > 0 ? (
        <div className="bg-white p-4">
          <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center">
            <span className="bg-purple-100 p-1 rounded-md mr-2">
              <BarChartIcon className="w-4 h-4 text-purple-600" />
            </span>
            Chart Visualization
          </h4>
          {finalChartDetails.description && (
            <div className="mb-4 bg-gray-50 p-3 rounded-md border border-gray-100">
              <p className="text-sm text-gray-600 italic">{finalChartDetails.description}</p>
            </div>
          )}
          <div className="border rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
            <AdvancedBarChart data={chartData} xKey="label" yKey="value" title={getChartTitle()} />
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">No chart data available for this query.</p>
      )}
    </div>
  );
};

export default AnswerDisplay;
