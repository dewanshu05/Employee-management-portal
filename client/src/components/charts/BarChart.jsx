import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ data, title, height = 280 }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: !!title,
        text: title,
        font: { size: 14, weight: '600', family: 'Plus Jakarta Sans' },
        color: '#1e293b',
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 12, family: 'Plus Jakarta Sans' },
        bodyFont: { size: 12, family: 'Plus Jakarta Sans' },
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
        ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans' }, stepSize: 1 },
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ height }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;
