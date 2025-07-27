// components/PointStyleChart.tsx
"use client";

import { useRef, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Chart } from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend
);

const POINT_STYLES = [
  "circle",
  "cross",
  "crossRot",
  "dash",
  "line",
  "rect",
  "rectRounded",
  "rectRot",
  "star",
  "triangle",
] as const;

export default function PointStyleChart() {
  const chartRef = useRef<Chart<"line">>(null);
  const [pointStyle, setPointStyle] = useState<typeof POINT_STYLES[number]>("circle");

  const changePointStyle = (style: typeof POINT_STYLES[number]) => {
    const chart = chartRef.current;
    if (!chart) return;

    chart.data.datasets.forEach((dataset) => {
      dataset.pointStyle = style;
    });

    chart.update();
    setPointStyle(style);
  };

  const data = {
    labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6"],
    datasets: [
      {
        label: "Dataset",
        data: [65, -20, 80, -35, 50, 90],
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        pointStyle,
        pointRadius: 10,
        pointHoverRadius: 15,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Point Style: ${pointStyle}`,
      },
    },
  };

  return (
    <div className="p-4">
      <Line ref={chartRef} data={data} options={options} />

      <div className="mt-4 flex flex-wrap gap-2">
        {POINT_STYLES.map((style) => (
          <button
            key={style}
            onClick={() => changePointStyle(style)}
            className={`px-3 py-1 rounded border text-sm ${
              pointStyle === style ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {style}
          </button>
        ))}
      </div>
    </div>
  );
}
