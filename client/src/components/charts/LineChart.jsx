import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChart = ({ data, title, height = 280 }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: { family: 'Plus Jakarta Sans', size: 12 },
          color: '#64748b',
        },
      },
      title: {
        display: !!title,
        text: title,
        font: { size: 14, weight: '600', family: 'Plus Jakarta Sans' },
        color: '#1e293b',
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans' } },
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans' } },
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ height }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;
