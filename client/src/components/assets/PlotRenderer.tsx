// src/components/assets/PlotRenderer.tsx
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter, Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend
);

interface PlotProps {
  plotData: {
    chart_type: string;
    x_label: string;
    y_label: string;
    x_data: number[];
    y_data: number[];
  };
}

export const PlotRenderer: React.FC<PlotProps> = ({ plotData }) => {
  const { chart_type, x_label, y_label, x_data, y_data } = plotData;

  // Format data for Chart.js
  const chartData = {
    labels: chart_type === 'bar' ? x_data : undefined,
    datasets: [
      {
        label: `${y_label} vs ${x_label}`,
        data: chart_type === 'bar' 
          ? y_data 
          : x_data.map((x, i) => ({ x, y: y_data[i] })),
        backgroundColor: 'rgba(59, 130, 246, 0.5)', // Blue-500
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        type: chart_type === 'bar' ? 'category' as const : 'linear' as const,
        title: { display: true, text: x_label, font: { weight: 'bold' as const } }
      },
      y: {
        title: { display: true, text: y_label, font: { weight: 'bold' as const } }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-4 bg-white p-4 border rounded-md shadow-sm">
      {chart_type === 'scatter' && <Scatter data={chartData} options={options} />}
      {chart_type === 'line' && <Line data={chartData} options={options} />}
      {chart_type === 'bar' && <Bar data={chartData} options={options} />}
    </div>
  );
};