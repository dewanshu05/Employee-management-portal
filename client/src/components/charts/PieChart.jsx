import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data, title, height = 280 }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 14,
          font: { family: 'Plus Jakarta Sans', size: 12 },
          color: '#475569',
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
  };

  return (
    <div style={{ height }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default PieChart;
