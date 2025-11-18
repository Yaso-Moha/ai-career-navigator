// imports/ui/components/FeedbackChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function FeedbackChart({ feedback }) {
  const labels = feedback.map((_, i) => `Q${i + 1}`);
  const clarity = feedback.map(f => f.scores.clarity);
  const completeness = feedback.map(f => f.scores.completeness);
  const technical = feedback.map(f => f.scores.technical);

  const data = {
    labels,
    datasets: [
      {
        label: 'Clarity',
        data: clarity,
        backgroundColor: '#60a5fa'
      },
      {
        label: 'Completeness',
        data: completeness,
        backgroundColor: '#34d399'
      },
      {
        label: 'Technical',
        data: technical,
        backgroundColor: '#f87171'
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#fff'
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#f9fafb' },
        grid: { color: '#374151' }
      },
      y: {
        min: 0,
        max: 5,
        ticks: { stepSize: 1, color: '#f9fafb' },
        grid: { color: '#374151' }
      }
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3 style={{ color: '#f9fafb', marginBottom: '1rem' }}>📊 Score Breakdown</h3>
      <Bar data={data} options={options} />
    </div>
  );
}
