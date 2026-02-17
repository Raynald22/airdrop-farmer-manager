"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Default dark chart styling
ChartJS.defaults.color = "hsl(215, 20%, 65%)";
ChartJS.defaults.borderColor = "hsl(217, 33%, 17%)";

interface ChainActivityChartProps {
  walletCount: number;
  stats?: Record<string, number>; // { "Scroll": 120, "Linea": 50 }
}

export function ChainActivityChart({ walletCount, stats }: ChainActivityChartProps) {
  // Use real stats if provided, otherwise 0
  const chartData = stats 
    ? [
        stats["zkSync"] || 0,
        stats["Scroll"] || 0,
        stats["Base"] || 0,
        stats["Linea"] || 0,
        stats["Unknown"] || 0, // placeholders
        0
      ]
    : [0, 0, 0, 0, 0, 0];

  const data = {
    labels: ["zkSync Era", "Scroll", "Base", "Linea", "Other", "Upcoming"],
    datasets: [
      {
        label: "Total Tx Count",
        data: chartData,
        backgroundColor: [
          "rgba(139, 141, 252, 0.6)",
          "rgba(255, 190, 152, 0.6)",
          "rgba(0, 82, 255, 0.6)",
          "rgba(97, 223, 255, 0.6)",
          "rgba(40, 160, 240, 0.6)",
          "rgba(255, 4, 32, 0.6)",
        ],
        borderColor: [
          "rgba(139, 141, 252, 1)",
          "rgba(255, 190, 152, 1)",
          "rgba(0, 82, 255, 1)",
          "rgba(97, 223, 255, 1)",
          "rgba(40, 160, 240, 1)",
          "rgba(255, 4, 32, 1)",
        ],
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "hsl(217, 33%, 17%)" },
        ticks: { font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  };

  return (
    <Card className="glass border-border/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Chain Activity Overview</CardTitle>
        <p className="text-xs text-muted-foreground">Average transaction count per chain</p>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
