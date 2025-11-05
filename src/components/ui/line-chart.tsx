"use client"

import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface LineConfig {
  key: string;
  name: string;
  color: string;
  borderColor?: string;
  backgroundColor?: string;
}

interface LineChartProps {
  data: Array<Record<string, any>>;
  lines: LineConfig[];
  xAxis: string;
  height?: number;
  title?: string;
}

export function LineChart({ data, lines, xAxis, height = 300, title }: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center border rounded-lg bg-muted/50"
        style={{ height }}
      >
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
  };

  // Prepare chart data
  const chartData = {
    labels: data.map(item => formatDate(item[xAxis])),
    datasets: lines.map(line => ({
      label: line.name,
      data: data.map(item => item[line.key] || 0),
      borderColor: line.borderColor || line.color,
      backgroundColor: line.backgroundColor || line.color + '20',
      borderWidth: 2,
      fill: false,
      tension: 0.3,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: line.borderColor || line.color,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
    }))
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${formatNumber(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11,
          },
          maxTicksLimit: 8,
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: function(value) {
            return formatNumber(Number(value));
          },
        },
        beginAtZero: true,
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
  };

  // Format number for display
  function formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  }

  return (
    <div style={{ height }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
